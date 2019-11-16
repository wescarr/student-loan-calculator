import {
  MONTHS,
  fixedRateRepayment,
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

export const RepaymentPlans = {
  STANDARD_FIXED: loan => ({
    label: 'Standard Fixed',
    eligible: true,
    ...fixedRateRepayment(loan)
  }),
  FIXED_EXTENDED: loan => ({
    label: 'Fixed Extended',
    eligible: [
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
    ...fixedRateRepayment(loan, 25)
  }),
  GRADUATED: loan => ({
    label: 'Graduated',
    eligible: [
      'DIRECT_SUBSIDIZED',
      'DIRECT_UNSUBSIDIZED',
      'DIRECT_PLUS_PRO',
      'DIRECT_PLUS_PARENTS',
      'DIRECT_CONSOLIDATED_SUBSIDIZED',
      'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
      'STAFFORD_SUBSIDIZED',
      'STAFFORD_UNSUBSIDIZED',
      'FFEL_CONSOLIDATED',
      'FFEL_PRO',
      'FFEL_PARENTS'
    ].includes(loan.type),
    ...graduatedRepayment(loan)
  }),
  GRADUATED_EXTENDED: loan => ({
    label: 'Graduated Extended',
    eligible: [
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
    ...graduatedRepayment(loan, 25)
  }),
  INCOME_BASED_REPAY: (loan, income) => {
    const eligible = partialFinancialHardship(loan, income, 0.15)
    const {payment, breakdown} = incomeBasedRepayment(loan, income)
    const forgiven =
      breakdown.length + loan.payments === 25 * MONTHS
        ? breakdown[breakdown.length - 1].balance
        : 0

    return {
      label: 'Income Based Repay - IBR',
      eligible:
        eligible &&
        [
          'DIRECT_SUBSIDIZED',
          'DIRECT_UNSUBSIDIZED',
          'STAFFORD_SUBSIDIZED',
          'STAFFORD_UNSUBSIDIZED',
          'FFEL_PRO',
          'FFEL_CONSOLIDATED',
          'DIRECT_PLUS_PRO',
          'DIRECT_PLUS_CONSOLIDATED'
        ].includes(loan.type),
      forgiven,
      payment,
      breakdown
    }
  },
  INCOME_BASED_REPAY_NEW: (loan, income) => {
    const eligible = partialFinancialHardship(loan, income, 0.1)
    const {payment, breakdown} = incomeBasedRepayment(loan, income, 20, 0.1)
    const forgiven =
      breakdown.length + loan.payments === 20 * MONTHS
        ? breakdown[breakdown.length - 1].balance
        : 0

    return {
      label: 'New IBR',
      eligible:
        eligible &&
        [
          'DIRECT_SUBSIDIZED',
          'DIRECT_UNSUBSIDIZED',
          'STAFFORD_SUBSIDIZED',
          'STAFFORD_UNSUBSIDIZED',
          'FFEL_PRO',
          'FFEL_CONSOLIDATED',
          'DIRECT_PLUS_PRO',
          'DIRECT_PLUS_CONSOLIDATED'
        ].includes(loan.type),
      forgiven,
      payment,
      breakdown
    }
  },
  PAY_AS_YOU_EARN: (loan, income) => {
    const eligible = partialFinancialHardship(loan, income, 0.1)
    const {payment, breakdown} = payeBasedRepayment(loan, income, 20, 0.1)
    const forgiven =
      breakdown.length + loan.payments === 20 * MONTHS
        ? breakdown[breakdown.length - 1].balance
        : 0

    return {
      label: 'Pay As Your Earn - PAYE',
      eligible:
        eligible &&
        [
          'DIRECT_SUBSIDIZED',
          'DIRECT_UNSUBSIDIZED',
          'STAFFORD_SUBSIDIZED',
          'STAFFORD_UNSUBSIDIZED',
          'FFEL_PRO',
          'FFEL_CONSOLIDATED',
          'DIRECT_PLUS_PRO',
          'DIRECT_PLUS_CONSOLIDATED'
        ].includes(loan.type),
      forgiven,
      payment,
      breakdown
    }
  },
  REVISED_PAY_AS_YOU_EARN: (loan, income) => {
    const eligible = partialFinancialHardship(loan, income, 0.1)
    const {payment, breakdown} = payeBasedRepayment(loan, income, 25, 0.1, true)
    const forgiven =
      breakdown.length === 25 * MONTHS
        ? breakdown[breakdown.length - 1].balance
        : 0

    return {
      label: 'Revised PAYE',
      eligible:
        eligible &&
        [
          'DIRECT_SUBSIDIZED',
          'DIRECT_UNSUBSIDIZED',
          'STAFFORD_SUBSIDIZED',
          'STAFFORD_UNSUBSIDIZED',
          'FFEL_PRO',
          'FFEL_CONSOLIDATED',
          'DIRECT_PLUS_PRO',
          'DIRECT_PLUS_CONSOLIDATED'
        ].includes(loan.type),
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
      eligible: [
        'DIRECT_SUBSIDIZED',
        'DIRECT_UNSUBSIDIZED',
        'DIRECT_CONSOLIDATED_SUBSIDIZED',
        'DIRECT_CONSOLIDATED_UNSUBSIDIZED',
        'DIRECT_PLUS_CONSOLIDATED',
        'DIRECT_PLUS_PRO'
      ].includes(loan.type),
      forgiven,
      payment,
      breakdown
    }
  }
}
