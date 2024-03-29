export const States = {
  LOWER_48: 'LOWER_48',
  ALASKA: 'ALASKA',
  HAWAII: 'HAWAII',
}

export const MONTHS = 12

// 0 index is the amount for each dependent over 8 persons
// Based on: https://aspe.hhs.gov/poverty-guidelines
const FEDERAL_POVERY_LEVEL = {
  LOWER_48: [4480, 12760, 17240, 21720, 26200, 30680, 35160, 39640, 44120],
  ALASKA: [5600, 15950, 21550, 27150, 32750, 38350, 43950, 49550, 55150],
  HAWAII: [5150, 14680, 19830, 24980, 30130, 35280, 40430, 45580, 50730],
}

// https://s3.amazonaws.com/public-inspection.federalregister.gov/2020-11818.pdf
const INCOME_PERCENTAGE_FACTOR = (year, inflation) => {
  inflation = Math.pow(1 + inflation, year)

  const factors = {
    single: [
      {income: 12392, factor: 0.55},
      {income: 17051, factor: 0.5779},
      {income: 21940, factor: 0.6057},
      {income: 26940, factor: 0.6623},
      {income: 31715, factor: 0.7189},
      {income: 37736, factor: 0.8033},
      {income: 47398, factor: 0.8877},
      {income: 59445, factor: 1.0},
      {income: 71496, factor: 1.0},
      {income: 85929, factor: 1.118},
      {income: 110029, factor: 1.235},
      {income: 115839, factor: 1.412},
      {income: 178683, factor: 1.5},
      {income: 318265, factor: 2.0},
    ],
    married: [
      {income: 12392, factor: 0.5052},
      {income: 19552, factor: 0.5668},
      {income: 23300, factor: 0.5956},
      {income: 30461, factor: 0.6779},
      {income: 37736, factor: 0.7522},
      {income: 47398, factor: 0.8761},
      {income: 59444, factor: 1.0},
      {income: 71496, factor: 1.0},
      {income: 89573, factor: 1.094},
      {income: 119691, factor: 1.25},
      {income: 161860, factor: 1.406},
      {income: 226369, factor: 1.5},
      {income: 369903, factor: 2.0},
    ],
  }

  factors.single.forEach((f) => (f.income = f.income * inflation))
  factors.married.forEach((f) => (f.income = f.income * inflation))

  return factors
}

export const getIncomePercentageFactor = (income, year = 0) => {
  const {rates, filing} = income
  const agi = getTotalIncome(income)
  const list = INCOME_PERCENTAGE_FACTOR(year, rates.inflation)[
    filing === 'SINGLE' ? 'single' : 'married'
  ]

  let i
  for (i = 0; i < list.length - 1; i++) {
    if (list[i].income >= agi) {
      if (list[i].income > agi && i > 0) {
        i--
      }
      break
    }
  }

  const lower = list[i]
  const upper = list[i + 1]

  if (!upper || lower.income === agi) {
    return lower.factor
  }

  // Interoplate factor between lower and upper incomes
  const percentage = (agi - lower.income) / (upper.income - lower.income)

  return lower.factor + (upper.factor - lower.factor) * percentage
}

export const getPovertyLevel = (income, year = 0) => {
  const {dependents, state, rates} = income
  const fpl = FEDERAL_POVERY_LEVEL[state]

  const level =
    dependents < 9 ? fpl[dependents] : fpl[8] + fpl[0] * (dependents - 8)

  return level * Math.pow(1 + rates.inflation, year)
}

export const getTotalIncome = (income) => {
  const {agi, agi_spouse = 0, filing} = income

  switch (filing) {
    case 'MARRIED_JOINT':
      return agi + agi_spouse
    case 'MARRIED_SEPARATE':
    case 'SINGLE':
    default:
      return agi
  }
}

export const getDiscretionaryIncome = (income, year) =>
  Math.max(0, getTotalIncome(income) - getPovertyLevel(income, year) * 1.5)

export const partialFinancialHardship = (loan, income, rate = 0.15) => {
  const {payment} = fixedRateRepayment(loan, 10)
  const discrectionary = getDiscretionaryIncome(income)

  return payment > (discrectionary / MONTHS) * rate
}

export const proRatedTerm = (loan, term, idr = false) => {
  return idr &&
    [
      'GRADUATED',
      'FIXED_EXTENDED',
      'GRADUATED_EXTENDED',
      'STANDARD_CONSOLIDATED',
    ].includes(loan.plan)
    ? term
    : (term * MONTHS - loan.payments) / MONTHS
}

// Interested is subsidized for first 3 years of subsidized loans
export const isInterestSubsidized = (loan, month, limit = 36) => {
  return (
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'STAFFORD_SUBSIDIZED',
    ].includes(loan.type) && month <= limit - loan.payments
  )
}

export const getLoanTerm = (loan) => {
  const {balance, type} = loan

  if (
    ![
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'DIRECT_PLUS_CONSOLIDATED',
      'FFEL_CONSOLIDATED',
    ].includes(type)
  ) {
    return
  }

  if (balance < 10000) {
    return 12
  } else if (balance < 20000) {
    return 15
  } else if (balance < 40000) {
    return 20
  } else if (balance < 60000) {
    return 25
  } else {
    return 30
  }
}

// TODO(wes): Inforce minimum payments
export const fixedRateRepayment = (loan, term = 10) => {
  term = proRatedTerm(loan, term)
  const {balance, rate} = loan
  const payment = getFixedPayment(balance, rate, term)
  const breakdown = getFixedBreakdown(payment, balance, rate, term)

  return {payment, breakdown}
}

export const graduatedRepayment = (loan, term = 10) => {
  term = proRatedTerm(loan, term)
  const {balance, rate} = loan
  const {payment, growthRate} = getGraduatedPayment(balance, rate, term)
  const breakdown = getGraduatedBreakdown(
    payment,
    balance,
    rate,
    term,
    growthRate
  )

  return {payment, breakdown}
}

export const incomeBasedRepayment = (
  loan,
  income,
  term = 25,
  disRate = 0.15
) => {
  term = proRatedTerm(loan, term, true)
  const {balance, rate} = loan
  const breakdown = getIncomeBreakdown(
    loan,
    balance,
    rate,
    term,
    income,
    disRate
  )

  return {payment: breakdown.length ? breakdown[0].payment : 0, breakdown}
}

export const getIncomeBreakdown = (
  loan,
  balance,
  interestRate,
  term,
  income,
  discretionaryRate
) => {
  let {rates} = income
  let agi = getTotalIncome(income)
  let discrectionary = getDiscretionaryIncome(income)
  const initialPayment = (discrectionary / MONTHS) * discretionaryRate
  const maxPayment = getFixedPayment(balance, interestRate, 10)

  const breakdown = []
  for (let i = 0; i < term * MONTHS; i++) {
    let last = breakdown[i - 1]
    if (!last) {
      last = {
        balance,
        payment: initialPayment,
        endingBalance: balance,
        totalInterest: 0,
        totalPayment: 0,
      }
    }

    let payment = last.payment
    let subsidizedPayment = 0
    // Increase payment every year.
    if (i > 0 && i % MONTHS === 0) {
      agi = agi * (1 + rates.income)
      discrectionary = getDiscretionaryIncome({...income, agi}, i / MONTHS)
      payment = Math.min(
        (discrectionary / MONTHS) * discretionaryRate,
        maxPayment
      )
    }
    const interest = (last.endingBalance * interestRate) / MONTHS
    if (isInterestSubsidized(loan, i) && payment < interest) {
      subsidizedPayment = interest - payment
    }
    const principle = payment + subsidizedPayment - interest
    const endingBalance = last.endingBalance - principle
    const totalInterest = interest + last.totalInterest
    const totalPayment = last.totalPayment + payment

    breakdown.push({
      balance: last.endingBalance,
      payment,
      interest,
      principle,
      endingBalance,
      totalInterest,
      totalPayment,
    })

    if (endingBalance <= 0) {
      break
    }
  }

  return breakdown
}

export const payeBasedRepayment = (
  loan,
  income,
  term = 20,
  disRate = 0.1,
  repay = false
) => {
  term = proRatedTerm(loan, term, true)
  const {balance, rate} = loan
  const breakdown = getPayeBreakdown(
    loan,
    balance,
    rate,
    term,
    income,
    disRate,
    repay
  )

  return {payment: breakdown.length ? breakdown[0].payment : 0, breakdown}
}

export const getPayeBreakdown = (
  loan,
  balance,
  interestRate,
  term,
  income,
  discretionaryRate,
  repay
) => {
  let {rates} = income
  let agi = getTotalIncome(income)
  let discrectionary = getDiscretionaryIncome(income)
  const initialPayment = (discrectionary / MONTHS) * discretionaryRate
  const maxPayment = repay
    ? Number.POSITIVE_INFINITY
    : getFixedPayment(balance, interestRate, 10)

  const breakdown = []
  for (let i = 0; i < term * MONTHS; i++) {
    let last = breakdown[i - 1]
    if (!last) {
      last = {
        balance,
        payment: initialPayment,
        endingBalance: balance,
        totalInterest: 0,
        totalPayment: 0,
      }
    }

    let payment = last.payment
    let subsidizedPayment = 0
    // Increase payment every year.
    if (i > 0 && i % MONTHS === 0) {
      agi = agi * (1 + rates.income)
      discrectionary = getDiscretionaryIncome({...income, agi}, i / MONTHS)
      payment = Math.min(
        (discrectionary / MONTHS) * discretionaryRate,
        maxPayment
      )
    }
    if (payment < 5) {
      payment = 0
    } else if (payment < 10) {
      payment = 10
    }
    const interest = (last.endingBalance * interestRate) / MONTHS
    if (isInterestSubsidized(loan, i) && payment < interest) {
      subsidizedPayment = interest - payment
    } else if (repay && payment < interest) {
      // REPAYE gets 50% subsidy on remaining term
      subsidizedPayment = (interest - payment) / 2
    }
    const principle = payment + subsidizedPayment - interest
    const endingBalance = last.endingBalance - principle
    const totalInterest = interest + last.totalInterest
    const totalPayment = last.totalPayment + payment

    breakdown.push({
      balance: last.endingBalance,
      payment,
      interest,
      principle,
      endingBalance,
      totalInterest,
      totalPayment,
    })

    if (endingBalance <= 0) {
      break
    }
  }

  return breakdown
}

export const icrBasedRepayment = (loan, income, term = 25) => {
  term = proRatedTerm(loan, term, true)
  const {balance, rate} = loan

  const breakdown = getIcrBreakdown(balance, rate, term, income)

  return {payment: breakdown.length ? breakdown[0].payment : 0, breakdown}
}

export const getIcrBreakdown = (balance, interestRate, term, income) => {
  let {rates} = income
  let agi = getTotalIncome(income)
  let discrectionary = agi - getPovertyLevel(income)
  let incomeFactor = getIncomePercentageFactor(income)
  let rollingIncome = income

  const disPay = (discrectionary / MONTHS) * 0.2
  const fixedPay = getFixedPayment(balance, interestRate, 12)
  const initialPayment = Math.max(0, Math.min(disPay, fixedPay * incomeFactor))

  const breakdown = []
  for (let i = 0; i < term * MONTHS; i++) {
    let last = breakdown[i - 1]
    if (!last) {
      last = {
        balance,
        payment: initialPayment,
        endingBalance: balance,
        totalInterest: 0,
        totalPayment: 0,
      }
    }

    let payment = last.payment
    // Increase payment every year based on income growth rate
    if (i > 0 && i % MONTHS === 0) {
      agi = agi * (1 + rates.income)
      rollingIncome = {...income, agi}
      discrectionary = agi - getPovertyLevel(rollingIncome, i / MONTHS)
      incomeFactor = getIncomePercentageFactor(rollingIncome, i / MONTHS)
      // Recalc fixed pay based on income factor
      payment = Math.max(
        0,
        Math.min((discrectionary / MONTHS) * 0.2, fixedPay * incomeFactor)
      )
    }
    if (payment > 0 && payment < 5) {
      payment = 5
    }
    const interest = (last.endingBalance * interestRate) / MONTHS
    const principle = payment - interest
    const endingBalance = last.endingBalance - principle
    const totalInterest = interest + last.totalInterest
    const totalPayment = last.totalPayment + payment

    breakdown.push({
      balance: last.endingBalance,
      payment,
      interest,
      principle,
      endingBalance,
      totalInterest,
      totalPayment,
    })

    if (endingBalance <= 0) {
      break
    }
  }

  return breakdown
}

// Calculates periodic payment amount for a loan with a constant interest rate
// and term in years. rateFactor is the number of interest periods per year.
export const getFixedPayment = (
  balance,
  interestRate,
  term = 10,
  rateFactor = MONTHS
) => {
  const Pv = balance
  const R = interestRate / rateFactor
  const n = term * MONTHS
  const P = (Pv * R) / (1 - Math.pow(1 + R, -n))

  return P
}

export const getFixedBreakdown = (payment, balance, interestRate, term) => {
  const breakdown = []
  for (let i = 0; i < term * MONTHS; i++) {
    let last = breakdown[i - 1]
    if (!last) {
      last = {
        balance,
        payment,
        endingBalance: balance,
        totalInterest: 0,
        totalPayment: 0,
      }
    }

    const interest = (last.endingBalance * interestRate) / MONTHS
    const principle = payment - interest
    const endingBalance = last.endingBalance - principle
    const totalInterest = interest + last.totalInterest
    const totalPayment = last.totalPayment + payment

    breakdown.push({
      balance: last.endingBalance,
      payment,
      interest,
      principle,
      endingBalance,
      totalInterest,
      totalPayment,
    })
  }

  return breakdown
}

export const getGraduatedPayment = (balance, interestRate, term) => {
  term = Math.ceil(term)
  // Min payment must be half of standard fixed payment
  let P = getFixedPayment(balance, interestRate, term) / 2

  // First payment must be only interest if possible
  P = Math.max(P, (balance * interestRate) / MONTHS)
  // Last payment can't be 3x initial payment
  let growthRate = Math.pow(3, 1 / (term / 2 - 1)) - 1

  // Adjust initial payment until ending balance is 0
  let breakdown = getGraduatedBreakdown(
    P,
    balance,
    interestRate,
    term,
    growthRate
  )

  while (
    breakdown.length &&
    breakdown[breakdown.length - 1].endingBalance > 0
  ) {
    P++
    breakdown = getGraduatedBreakdown(
      P,
      balance,
      interestRate,
      term,
      growthRate
    )
  }

  // If breakdown is less than full term, decrease final payment until breakdown
  // is over the entire term
  let lastP = P * Math.pow(1 + growthRate, term / 2 - 1)
  while (lastP > P + 1 && breakdown.length < term * MONTHS) {
    lastP--
    growthRate = Math.pow(lastP / P, 1 / (term / 2 - 1)) - 1

    breakdown = getGraduatedBreakdown(
      P,
      balance,
      interestRate,
      term,
      growthRate
    )
  }

  return {payment: P, growthRate}
}

export const getGraduatedBreakdown = (
  initialPayment,
  balance,
  interestRate,
  term,
  growthRate = 0.05
) => {
  const breakdown = []
  for (let i = 0; i < term * MONTHS; i++) {
    let last = breakdown[i - 1]
    if (!last) {
      last = {
        balance,
        payment: initialPayment,
        endingBalance: balance,
        totalInterest: 0,
        totalPayment: 0,
      }
    }

    let payment = last.payment
    // Increase payment every 2 yearss
    if (i > 0 && i % 24 === 0) {
      payment = payment * (1 + growthRate)
    }
    const interest = (last.endingBalance * interestRate) / MONTHS
    const principle = payment - interest
    const endingBalance = last.endingBalance - principle
    const totalInterest = interest + last.totalInterest
    const totalPayment = last.totalPayment + payment

    breakdown.push({
      balance: last.endingBalance,
      payment,
      interest,
      principle,
      endingBalance,
      totalInterest,
      totalPayment,
    })

    if (last.endingBalance <= 0) {
      break
    }
  }

  return breakdown
}
