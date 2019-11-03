import {
  fixedRateRepayment,
  graduatedRepayment,
  incomeBasedRepayment,
  partialFinancialHardship
} from './calc'

export const LoanTypes = {
  DIRECT_SUBSIDIZED: 'Direct Subsidized Loan',
  DIRECT_UNSUBSIDIZED: 'Direct Unsubsidized Loan',
  STAFFORD_SUBSIDIZED: 'Subsidized Federal Stafford Loan',
  STAFFORD_UNSUBSIDIZED: 'Unsubsidized Federal Stafford Loan',
  DIRECT_CONSOLIDATED_SUBSIDIZED: 'Direct Subsidized Consolidation Loan',
  DIRECT_CONSOLIDATED_UNSUBSIDIZED: 'Direct Unsubsidized Consolidation Loan',
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
  MARRIED_SEPARATE: 'Married filing separately',
  HEAD_OF_HOUSEHOLD: 'Head of household'
}

// Colors: https://www.colorbox.io/#steps=7#hue_start=184#hue_end=359#hue_curve=linear#sat_start=52#sat_end=90#sat_curve=linear#sat_rate=130#lum_start=100#lum_end=100#lum_curve=easeOutQuad#minor_steps_map=0
const Colors = [
  '#3E94FF',
  '#3129FF',
  '#8F14FF',
  '#FF00FC',
  '#FF0080',
  '#FF0004',
  '#53F4FF',
  '#48C6FF'
]

export const RepaymentPlans = {
  STANDARD_FIXED: loan => ({
    label: 'Standard Fixed',
    color: Colors[0],
    eligible: true,
    ...fixedRateRepayment(loan)
  }),
  FIXED_EXTENDED: loan => ({
    label: 'Fixed Extended',
    color: Colors[1],
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
    color: Colors[3],
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
    color: Colors[4],
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
    return {
      label: 'Income Based Repay - IBR',
      color: Colors[5],
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
      ...incomeBasedRepayment(loan, income)
    }
  },
  INCOME_BASED_REPAY_NEW: (loan, income) => {
    const eligible = partialFinancialHardship(loan, income, 0.1)
    return {
      label: 'New IBR',
      color: Colors[6],
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
      ...incomeBasedRepayment(loan, income, 20, 0.1)
    }
  },
  PAY_AS_YOU_EARN: (loan, income) => {
    const eligible = partialFinancialHardship(loan, income, 0.1)
    return {
      label: 'Pay As Your Earn',
      color: Colors[7],
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
      ...incomeBasedRepayment(loan, income, 20, 0.1)
    }
  }
}
