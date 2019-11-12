export const States = {
  LOWER_48: 'LOWER_48',
  ALASKA: 'ALASKA',
  HAWAII: 'HAWAII'
}

export const MONTHS = 12

// Annual income growth percentage
export const INCOME_GROWTH_RATE = 0.05

// 0 index is the amount for each dependent over 8 persons
// Based on: https://aspe.hhs.gov/poverty-guidelines
const FEDERAL_POVERY_LEVEL = {
  LOWER_48: [4420, 12490, 16910, 21330, 25750, 30170, 34590, 39010, 43430],
  ALASKA: [5530, 15600, 21130, 26660, 32190, 37720, 43250, 48780, 54310],
  HAWAII: [5080, 14380, 19460, 24540, 29620, 34700, 39780, 44860, 49940]
}

// https://www.federalregister.gov/documents/2018/08/02/2018-16582/annual-updates-to-the-income-contingent-repayment-icr-plan-formula-for-2018-william-d-ford-federal
const INCOME_PERCENTAGE_FACTOR = {
  single: [
    {income: 11860, factor: 0.55},
    {income: 16318, factor: 0.5779},
    {income: 20997, factor: 0.6057},
    {income: 25782, factor: 0.6623},
    {income: 30352, factor: 0.7189},
    {income: 36114, factor: 0.8033},
    {income: 45361, factor: 0.8877},
    {income: 56891, factor: 1.0},
    {income: 68424, factor: 1.0},
    {income: 82238, factor: 1.118},
    {income: 105302, factor: 1.235},
    {income: 149143, factor: 1.412},
    {income: 171006, factor: 1.5},
    {income: 304590, factor: 2.0}
  ],
  married: [
    {income: 11860, factor: 0.5052},
    {income: 18712, factor: 0.5668},
    {income: 22299, factor: 0.5956},
    {income: 29152, factor: 0.6779},
    {income: 36114, factor: 0.7522},
    {income: 45361, factor: 0.8761},
    {income: 56890, factor: 1.0},
    {income: 68424, factor: 1.0},
    {income: 85724, factor: 1.094},
    {income: 114547, factor: 1.25},
    {income: 154905, factor: 1.406},
    {income: 216641, factor: 1.5},
    {income: 354009, factor: 2.0}
  ]
}

export const getIncomePercentageFactor = (income, status = 'single') => {
  const list = INCOME_PERCENTAGE_FACTOR[status]

  let i
  for (i = 0; i < list.length; i++) {
    if (list[i].income >= income) {
      if (list[i].income > income && i > 0) {
        i--
      }
      break
    }
  }

  const lower = list[i]
  const upper = list[i + 1]

  if (!upper || lower.income === income) {
    return lower.factor
  }

  // Interoplate factor between lower and upper incomes
  const percentage = (income - lower.income) / (upper.income - lower.income)

  return lower.factor + (upper.factor - lower.factor) * percentage
}

export const getDiscretionaryIncome = (agi, dependents = 1, state) => {
  const fpl = FEDERAL_POVERY_LEVEL[state]

  let level
  if (dependents < 9) {
    level = fpl[dependents]
  } else {
    level = fpl[8] + fpl[0] * (dependents - 8)
  }

  return Math.max(0, agi - level * 1.5)
}

export const partialFinancialHardship = (loan, income, rate = 0.15) => {
  const {payment} = fixedRateRepayment(loan, 10)
  const discrectionary = getDiscretionaryIncome(
    income.agi,
    income.dependents,
    income.state
  )

  return payment > (discrectionary / MONTHS) * rate
}

export const proRatedTerm = (loan, term) =>
  (term * MONTHS - loan.payments) / MONTHS

// Interested is subsidized for first 3 years of subsidized loans
export const isInterestSubsidized = (loan, month, limit = 36) => {
  return (
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'STAFFORD_SUBSIDIZED'
    ].includes(loan.type) && month <= limit - loan.payments
  )
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
  term = proRatedTerm(loan, term)
  const {balance, rate} = loan
  const discrectionary = getDiscretionaryIncome(
    income.agi,
    income.dependents,
    income.state
  )

  const payment = (discrectionary / MONTHS) * disRate
  const maxPayment = getFixedPayment(balance, rate, 10)
  const breakdown = getIncomeBreakdown(
    loan,
    payment,
    maxPayment,
    balance,
    rate,
    term,
    INCOME_GROWTH_RATE
  )

  return {payment, breakdown}
}

export const getIncomeBreakdown = (
  loan,
  initialPayment,
  maxPayment,
  balance,
  interestRate,
  term,
  growthRate
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
        totalPayment: 0
      }
    }

    let payment = last.payment
    let subsidizedPayment = 0
    // Increase payment every year.
    if (i > 0 && i % MONTHS === 0) {
      payment = Math.min(payment * (1 + growthRate), maxPayment)
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
      totalPayment
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
  term = proRatedTerm(loan, term)
  const {balance, rate} = loan
  const discrectionary = getDiscretionaryIncome(
    income.agi,
    income.dependents,
    income.state
  )

  const payment = (discrectionary / MONTHS) * disRate
  const maxPayment = getFixedPayment(balance, rate, 10)
  const breakdown = getPayeBreakdown(
    loan,
    payment,
    maxPayment,
    balance,
    rate,
    term,
    INCOME_GROWTH_RATE,
    repay
  )

  return {payment, breakdown}
}

export const getPayeBreakdown = (
  loan,
  initialPayment,
  maxPayment,
  balance,
  interestRate,
  term,
  growthRate,
  repay
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
        totalPayment: 0
      }
    }

    let payment = last.payment
    let subsidizedPayment = 0
    // Increase payment every year.
    if (i > 0 && i % MONTHS === 0) {
      payment = Math.min(payment * (1 + growthRate), maxPayment)
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
      totalPayment
    })

    if (endingBalance <= 0) {
      break
    }
  }

  return breakdown
}

export const icrBasedRepayment = (loan, income, term = 25, disRate = 0.2) => {
  term = proRatedTerm(loan, term)
  const {balance, rate} = loan
  const discrectionary = getDiscretionaryIncome(
    income.agi,
    income.dependents,
    income.state
  )

  const incomeFactor = getIncomePercentageFactor(
    income.agi,
    income.filing === 'SINGLE' ? 'single' : 'married'
  )

  const disPay = (discrectionary / MONTHS) * disRate
  const fixedPay = getFixedPayment(balance, rate, 12) * incomeFactor

  const payment = Math.min(disPay, fixedPay)
  const maxPayment = Math.max(disPay, fixedPay)

  const breakdown = getIcrBreakdown(
    payment,
    maxPayment,
    balance,
    rate,
    term,
    INCOME_GROWTH_RATE
  )

  return {payment, breakdown}
}

export const getIcrBreakdown = (
  initialPayment,
  maxPayment,
  balance,
  interestRate,
  term,
  growthRate
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
        totalPayment: 0
      }
    }

    let payment = last.payment
    // Increase payment every year.
    if (i > 0 && i % MONTHS === 0) {
      payment = Math.min(payment * (1 + growthRate), maxPayment)
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
      totalPayment
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
        totalPayment: 0
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
      totalPayment
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
        totalPayment: 0
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
      totalPayment
    })

    if (last.endingBalance <= 0) {
      break
    }
  }

  return breakdown
}
