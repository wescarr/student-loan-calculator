import {
  MONTHS,
  fixedRateRepayment,
  getExtendedLoanTerm,
  graduatedRepayment,
  icrBasedRepayment,
  incomeBasedRepayment,
  partialFinancialHardship,
  payeBasedRepayment
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
  PRIVATE: 'Private Loan'
}

export const TaxFilingStatus = {
  SINGLE: 'Single',
  MARRIED_JOINT: 'Married filing jointly',
  MARRIED_SEPARATE: 'Married filing separately'
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
  INCOME: 'Income Driven Plan'
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
  INCOME_CONTINGENT_REPAY: 'INCOME_CONTINGENT_REPAY'
}

export const RepaymentEligible = {
  STANDARD_FIXED: () => true,
  FIXED_EXTENDED: loan =>
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
      'FFEL_CONSOLIDATED'
    ].includes(loan.type),
  GRADUATED: loan =>
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
      'FFEL_PARENTS'
    ].includes(loan.type),
  GRADUATED_EXTENDED: loan =>
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
      'FFEL_CONSOLIDATED'
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
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED'
    ].includes(loan.type),
  INCOME_BASED_REPAY_NEW: (loan, income) =>
    partialFinancialHardship(loan, income, 0.1) &&
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'DIRECT_PLUS_PRO'
    ].includes(loan.type),
  PAY_AS_YOU_EARN: (loan, income) =>
    partialFinancialHardship(loan, income, 0.1) &&
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'DIRECT_PLUS_PRO'
    ].includes(loan.type),
  REVISED_PAY_AS_YOU_EARN: (loan, income) =>
    partialFinancialHardship(loan, income, 0.1) &&
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'DIRECT_PLUS_PRO'
    ].includes(loan.type),
  INCOME_CONTINGENT_REPAY: loan =>
    [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'DIRECT_PLUS_PRO'
    ].includes(loan.type)
}

export const isPlanEligible = (type, loan, income) =>
  RepaymentEligible[type](loan, income)

export const eligiblePlans = (loan, income) =>
  Object.keys(Plans).filter(type => isPlanEligible(type, loan, income))

export const RepaymentPlans = {
  STANDARD_FIXED: loan => ({
    label: 'Standard Fixed',
    eligible: isPlanEligible(Plans.STANDARD_FIXED, loan),
    ...fixedRateRepayment(loan)
  }),
  FIXED_EXTENDED: loan => ({
    label: 'Fixed Extended',
    eligible: isPlanEligible(Plans.FIXED_EXTENDED, loan),
    ...fixedRateRepayment(loan, getExtendedLoanTerm(loan))
  }),
  GRADUATED: loan => ({
    label: 'Graduated',
    eligible: isPlanEligible(Plans.GRADUATED, loan),
    ...graduatedRepayment(loan)
  }),
  GRADUATED_EXTENDED: loan => ({
    label: 'Graduated Extended',
    eligible: isPlanEligible(Plans.GRADUATED_EXTENDED, loan),
    ...graduatedRepayment(loan, getExtendedLoanTerm(loan))
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
      forgiven,
      payment,
      breakdown
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
      forgiven,
      payment,
      breakdown
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
      forgiven,
      payment,
      breakdown
    }
  },
  REVISED_PAY_AS_YOU_EARN: (loan, income) => {
    const {payment, breakdown} = payeBasedRepayment(loan, income, 25, 0.1, true)
    const forgiven =
      breakdown.length === 25 * MONTHS
        ? breakdown[breakdown.length - 1].balance
        : 0

    return {
      label: 'Revised PAYE',
      eligible: isPlanEligible(Plans.REVISED_PAY_AS_YOU_EARN, loan, income),
      forgiven,
      payment,
      breakdown
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
      forgiven,
      payment,
      breakdown
    }
  }
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
    RepaymentPlans.INCOME_CONTINGENT_REPAY(loan, income)
  ].filter(r => r.breakdown.length)

export const consolidateLoans = (loans, income) => {
  if (loans.length === 1) {
    return loans[0]
  }

  const balance = loans.reduce((b, l) => l.balance + b, 0)
  const rate = loans.reduce((r, l) => (l.balance / balance) * l.rate + r, 0)
  const payments = loans.reduce((p, l) => l.payments + p, 0)
  const eligibility = loans.map(l => ({
    type: l.type,
    eligible: eligiblePlans(l, income)
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
    type
  }
}
