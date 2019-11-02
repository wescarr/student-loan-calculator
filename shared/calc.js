export const States = {
  LOWER_48: 'LOWER_48',
  ALASKA: 'ALASKA',
  HAWAII: 'HAWAII'
}

// 0 index is the amount for each dependent over 8 persons
// Based on: https://aspe.hhs.gov/poverty-guidelines
const FEDERAL_POVERY_LEVEL = {
  LOWER_48: [4420, 12490, 16910, 21330, 25750, 30170, 34590, 39010, 43430],
  ALASKA: [5530, 15600, 21130, 26660, 32190, 37720, 43250, 48780, 54310],
  HAWAII: [5080, 14380, 19460, 24540, 29620, 34700, 39780, 44860, 49940]
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

// TODO(wes): Inforce minimum payments
export const fixedRateRepayment = (loan, term = 10) => {
  const {balance, rate} = loan
  const payment = getFixedPayment(balance, rate, term)
  const breakdown = getFixedBreakdown(payment, balance, rate, term)

  return {payment, breakdown}
}

export const graduatedRepayment = (loan, term = 10) => {
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

// Calculates periodic payment amount for a loan with a constant interest rate
// and term in years. rateFactor is the number of interest periods per year.
export const getFixedPayment = (
  balance,
  interestRate,
  term = 10,
  rateFactor = 12
) => {
  const Pv = balance
  const R = interestRate / rateFactor
  const n = term * 12
  const P = (Pv * R) / (1 - Math.pow(1 + R, -n))

  return P
}

export const getFixedBreakdown = (payment, balance, interestRate, term) => {
  const breakdown = []
  for (let i = 0; i < term * 12; i++) {
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

    const interest = (last.endingBalance * interestRate) / 12
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
  P = Math.max(P, (balance * interestRate) / 12)
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
  while (lastP > P + 1 && breakdown.length < term * 12) {
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
  for (let i = 0; i < term * 12; i++) {
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
    const interest = (last.endingBalance * interestRate) / 12
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
