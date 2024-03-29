import {
  MONTHS,
  fixedRateRepayment,
  getLoanTerm,
  graduatedRepayment,
  icrBasedRepayment,
  incomeBasedRepayment,
  partialFinancialHardship,
  payeBasedRepayment,
} from './calc'

export const LoanTypes = {
  DIRECT_SUBSIDIZED: 'Direct Subsidized Loan',
  DIRECT_UNSUBSIDIZED: 'Direct Unsubsidized Loan',
  DIRECT_CONSOLIDATED_SUBSIDIZED: 'Direct Subsidized Consolidation Loan',
  DIRECT_CONSOLIDATED_UNSUBSIDIZED: 'Direct Unsubsidized Consolidation Loan',
  STAFFORD_SUBSIDIZED: 'FFEL Subsidized Federal Stafford Loan',
  STAFFORD_UNSUBSIDIZED: 'FFEL Unsubsidized Federal Stafford Loan',
  FFEL_CONSOLIDATED: 'FFEL Consolidation Loan',
  FFEL_PRO: 'FFEL PLUS Loan for Graduate/Professional Students',
  FFEL_PARENTS: 'FFEL PLUS Loan for Parents',
  DIRECT_PLUS_PRO: 'Direct PLUS Loan for Graduate/Professional Students',
  DIRECT_PLUS_PARENTS: 'Direct PLUS Loan for Parents',
  DIRECT_PLUS_CONSOLIDATED: 'Direct PLUS Consolidation Loan',
  FEDERAL_PERKINS: 'Federal Perkins Loan',
  PRIVATE: 'Private Loan',
}

export const TaxFilingStatus = {
  SINGLE: 'Single',
  MARRIED_SEPARATE: 'Married filing separately',
  MARRIED_JOINT: 'Married filing jointly',
}

// Options for existing loan payments.
// TODO(wes): Ask Betsy if it's just best to present the full instead for
// users for consistency.
export const LoanRepaymentTypes = {
  STANDARD_FIXED: 'Standard Fixed',
  STANDARD_CONSOLIDATED: 'Standard Consolidated',
  FIXED_EXTENDED: 'Fixed Extended',
  GRADUATED: 'Graduated',
  GRADUATED_EXTENDED: 'Graduated Extended',
  INCOME: 'Income Driven Plan',
}

const Plans = {
  STANDARD_FIXED: 'STANDARD_FIXED',
  FIXED_EXTENDED: 'FIXED_EXTENDED',
  GRADUATED: 'GRADUATED',
  GRADUATED_EXTENDED: 'GRADUATED_EXTENDED',
  INCOME_BASED_REPAY: 'INCOME_BASED_REPAY',
  INCOME_BASED_REPAY_NEW: 'INCOME_BASED_REPAY_NEW',
  PAY_AS_YOU_EARN: 'PAY_AS_YOU_EARN',
  REVISED_PAY_AS_YOU_EARN: 'REVISED_PAY_AS_YOU_EARN',
  INCOME_CONTINGENT_REPAY: 'INCOME_CONTINGENT_REPAY',
}

export const RepaymentEligible = {
  STANDARD_FIXED: () => true,
  FIXED_EXTENDED: (loan) =>
    loan.balance > 30000 &&
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'STAFFORD_SUBSIDIZED',
      'STAFFORD_UNSUBSIDIZED',
      'DIRECT_PLUS_PRO',
      'DIRECT_PLUS_PARENTS',
      'DIRECT_PLUS_CONSOLIDATED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'FFEL_CONSOLIDATED',
      'FFEL_PRO',
      'FFEL_PARENTS',
    ].includes(loan.type),
  GRADUATED: (loan) =>
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'DIRECT_PLUS_PRO',
      'DIRECT_PLUS_PARENTS',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'DIRECT_PLUS_CONSOLIDATED',
      'STAFFORD_SUBSIDIZED',
      'STAFFORD_UNSUBSIDIZED',
      'FFEL_CONSOLIDATED',
      'FFEL_PRO',
      'FFEL_PARENTS',
    ].includes(loan.type),
  GRADUATED_EXTENDED: (loan) =>
    loan.balance > 30000 &&
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'STAFFORD_SUBSIDIZED',
      'STAFFORD_UNSUBSIDIZED',
      'DIRECT_PLUS_PRO',
      'DIRECT_PLUS_PARENTS',
      'DIRECT_PLUS_CONSOLIDATED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'FFEL_CONSOLIDATED',
      'FFEL_PRO',
      'FFEL_PARENTS',
    ].includes(loan.type),
  INCOME_BASED_REPAY: (loan, income) =>
    partialFinancialHardship(loan, income, 0.15) &&
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'STAFFORD_SUBSIDIZED',
      'STAFFORD_UNSUBSIDIZED',
      'FFEL_PRO',
      'FFEL_CONSOLIDATED',
      'DIRECT_PLUS_PRO',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
    ].includes(loan.type),
  INCOME_BASED_REPAY_NEW: (loan, income) =>
    partialFinancialHardship(loan, income, 0.15) &&
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'DIRECT_PLUS_PRO',
    ].includes(loan.type),
  PAY_AS_YOU_EARN: (loan, income) =>
    partialFinancialHardship(loan, income, 0.1) &&
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'DIRECT_PLUS_PRO',
    ].includes(loan.type),
  REVISED_PAY_AS_YOU_EARN: (loan) =>
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'DIRECT_PLUS_PRO',
    ].includes(loan.type),
  INCOME_CONTINGENT_REPAY: (loan) =>
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'DIRECT_PLUS_PRO',
    ].includes(loan.type),
}

export const RepaymentRequirements = {
  INCOME_BASED_REPAY: ['IDR', 'PFH'],
  INCOME_BASED_REPAY_NEW: ['IDR', 'PFH'],
  INCOME_CONTINGENT_REPAY: ['IDR'],
  PAY_AS_YOU_EARN: ['IDR', 'PFH'],
  REVISED_PAY_AS_YOU_EARN: ['IDR'],
}

export const isPlanEligible = (type, loan, income) =>
  RepaymentEligible[type](loan, income)

export const eligiblePlans = (loan, income) =>
  Object.keys(Plans).filter((type) => isPlanEligible(type, loan, income))

export const RepaymentPlans = {
  STANDARD_FIXED: (loan) => ({
    label: 'Standard Fixed',
    eligible: isPlanEligible(Plans.STANDARD_FIXED, loan),
    description:
      'You pay a fixed amount each month of at least $50 for up to 10 years.',
    ...fixedRateRepayment(loan, getLoanTerm(loan)),
  }),
  FIXED_EXTENDED: (loan) => ({
    label: 'Fixed Extended',
    eligible: isPlanEligible(Plans.FIXED_EXTENDED, loan),
    description:
      'You pay a fixed amount each month for up to 25 years. You must have a loan balance of over $30K in outstanding Direct Loans or over $30K in outstanding FFELP loans to qualify. You must have had no outstanding balance on a Direct Loan and/or a FFELP Loan as of October 7, 1998, or on the date you obtained a Direct Loan and/or a FFELP Loan after October 7, 1998.',
    ...fixedRateRepayment(loan, 25),
  }),
  GRADUATED: (loan) => ({
    label: 'Graduated',
    eligible: isPlanEligible(Plans.GRADUATED, loan),
    description:
      'You make monthly payments that increase every 2 years and last for up to 10 years. Each payment must cover at least the monthly interest on your loan. Any single payment cannot be more than 3 times greater than the amount of any other payment.',
    ...graduatedRepayment(loan, getLoanTerm(loan)),
  }),
  GRADUATED_EXTENDED: (loan) => ({
    label: 'Graduated Extended',
    eligible: isPlanEligible(Plans.GRADUATED_EXTENDED, loan),
    description:
      'You make monthly payments that increase every 2 years and last for up to 25 years. Each payment must cover at least the monthly interest on your loan. Any single payment cannot be more than 3 times greater than the amount any other payment. You must have a loan balance of over $30K to qualify.',
    ...graduatedRepayment(loan, 25),
  }),
  INCOME_BASED_REPAY: (loan, income) => {
    const {payment, breakdown} = incomeBasedRepayment(loan, income)
    const forgiven =
      breakdown.length + loan.payments === 25 * MONTHS
        ? breakdown[breakdown.length - 1].balance
        : 0

    return {
      label: 'Income Based Repay - IBR',
      eligible: isPlanEligible(Plans.INCOME_BASED_REPAY, loan, income),
      requirements: RepaymentRequirements[Plans.INCOME_BASED_REPAY],
      description:
        'You make monthly payments that are no more than 15% of your discretionary income for up to 25 years. If your payment is less than the monthly accrued interest, the government may subsidize the unpaid interest on your subsidized loans for the first three years. Parent PLUS loans are not eligible for this plan.',
      forgiven,
      payment,
      breakdown,
    }
  },
  INCOME_BASED_REPAY_NEW: (loan, income) => {
    const {payment, breakdown} = incomeBasedRepayment(loan, income, 20, 0.1)
    const forgiven =
      breakdown.length + loan.payments === 20 * MONTHS
        ? breakdown[breakdown.length - 1].balance
        : 0

    return {
      label: 'New IBR',
      eligible: isPlanEligible(Plans.INCOME_BASED_REPAY_NEW, loan, income),
      requirements: RepaymentRequirements[Plans.INCOME_BASED_REPAY_NEW],
      description:
        'You make monthly payments that are no more than 10% of your discretionary income for up to 20 years. If your payment is less than the monthly accrued interest, the government may subsidize the unpaid interest on your subsidized loans for the first three years.  FFELP and parent PLUS loans are not eligible for this plan. To qualify for IBR for new borrowers, you must have had no outstanding balance on a Direct or FFELP loan when you borrowed a Direct loan on or after July 1, 2014.',
      forgiven,
      payment,
      breakdown,
    }
  },
  PAY_AS_YOU_EARN: (loan, income) => {
    const {payment, breakdown} = payeBasedRepayment(loan, income, 20, 0.1)
    const forgiven =
      breakdown.length + loan.payments === 20 * MONTHS
        ? breakdown[breakdown.length - 1].balance
        : 0

    return {
      label: 'Pay As Your Earn - PAYE',
      eligible: isPlanEligible(Plans.PAY_AS_YOU_EARN, loan, income),
      requirements: RepaymentRequirements[Plans.PAY_AS_YOU_EARN],
      description:
        'You make monthly payments that are 10% of your discretionary income for up to 20 years. If your payment is less than the monthly accrued interest, the government may subsidize the unpaid interest on your subsidized loans for the first three years.  FFELP and parent PLUS loans are not eligible for this plan. FFELP loans, other than parent PLUS loans, can become eligible through loan consolidation. To qualify for PAYE, you need to have borrowed your first federal student loan after October 1, 2007, and you need to have received a disbursement of a Direct Loan or a Direct Consolidation Loan on or after October 1, 2011.',
      forgiven,
      payment,
      breakdown,
    }
  },
  REVISED_PAY_AS_YOU_EARN: (loan, income) => {
    // Override filing if not single to make sure incomes are combined
    const reIncome = {...income}
    if (reIncome.filing !== 'SINGLE') {
      reIncome.filing = 'MARRIED_JOINT'
    }

    const {payment, breakdown} = payeBasedRepayment(
      loan,
      reIncome,
      25,
      0.1,
      true
    )
    const forgiven =
      breakdown.length === 25 * MONTHS
        ? breakdown[breakdown.length - 1].balance
        : 0

    return {
      label: 'Revised PAYE',
      eligible: isPlanEligible(Plans.REVISED_PAY_AS_YOU_EARN, loan, reIncome),
      requirements: RepaymentRequirements[Plans.REVISED_PAY_AS_YOU_EARN],
      description:
        'You make monthly payments that are no more than 10% of your discretionary income for up to 20 or 25 years. If your payment is less than the monthly accrued interest, the government may subsidize the unpaid interest on your subsidized loans for the first three years.  They will subsidize half of the unpaid interest on all loans under this plan for as long as the monthly payment amount is less than the monthly accrued interest.  FFELP and parent PLUS loans are not eligible for this plan. FFELP loans, other than parent PLUS loans, can become eligible through loan consolidation.',
      forgiven,
      payment,
      breakdown,
    }
  },
  INCOME_CONTINGENT_REPAY: (loan, income) => {
    const {payment, breakdown} = icrBasedRepayment(loan, income, 25, 0.2)
    const forgiven =
      breakdown.length === 25 * MONTHS
        ? breakdown[breakdown.length - 1].balance
        : 0

    return {
      label: 'Income Contingent Repay - ICR',
      eligible: isPlanEligible(Plans.INCOME_CONTINGENT_REPAY, loan),
      requirements: RepaymentRequirements[Plans.INCOME_CONTINGENT_REPAY],
      description:
        'You make monthly payments that are either no more than 20% of your discretionary income or what you would pay under a standard 12-year plan based on your income, whichever is less for up to 25 years.  FFELP and parent PLUS loans are not eligible for this plan; however, these loans may become eligible for this plan if they are consolidated into a Direct Consolidation loan. This is the only income driven repayment plan available to parent PLUS loans that have been consolidated.',
      forgiven,
      payment,
      breakdown,
    }
  },
}

export const getRepaymentOpions = (loan, income) =>
  [
    RepaymentPlans.STANDARD_FIXED(loan),
    RepaymentPlans.GRADUATED(loan),
    RepaymentPlans.FIXED_EXTENDED(loan),
    RepaymentPlans.GRADUATED_EXTENDED(loan),
    RepaymentPlans.INCOME_BASED_REPAY(loan, income),
    RepaymentPlans.INCOME_BASED_REPAY_NEW(loan, income),
    RepaymentPlans.PAY_AS_YOU_EARN(loan, income),
    RepaymentPlans.REVISED_PAY_AS_YOU_EARN(loan, income),
    RepaymentPlans.INCOME_CONTINGENT_REPAY(loan, income),
  ].filter((r) => r.breakdown.length)

export const consolidateLoans = (loans, income) => {
  if (loans.length === 1) {
    return loans[0]
  }

  const balance = loans.reduce((b, l) => l.balance + b, 0)
  const rate = loans.reduce((r, l) => (l.balance / balance) * l.rate + r, 0)
  const payments = loans.reduce((p, l) => l.payments + p, 0)
  const eligibility = loans.map((l) => ({
    type: l.type,
    eligible: eligiblePlans(l, income),
  }))
  // Choose loan type with least repayment options
  const [{type}] = eligibility.sort(
    (a, b) => a.eligible.length - b.eligible.length
  )

  return {
    balance,
    rate,
    payments,
    plan: '', // TODO(wes): Ask for guidance on what plan to choose
    type,
  }
}
