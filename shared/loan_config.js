import {fixedRateRepayment, graduatedRepayment} from './calc'

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

// Colors: https://www.colorbox.io/#steps=10#hue_start=359#hue_end=0#hue_curve=easeInOutQuad#sat_start=43#sat_end=78#sat_curve=easeOutQuad#sat_rate=136#lum_start=100#lum_end=100#lum_curve=easeOutQuad#minor_steps_map=none
export const RepaymentPlans = {
  STANDARD_FIXED: loan => ({
    label: 'Standard Fixed',
    color: '#06FF54',
    eligible: true,
    ...fixedRateRepayment(loan, (10 * 12 - loan.payments) / 12)
  }),
  FIXED_EXTENDED: loan => ({
    label: 'Fixed Extended',
    color: '#1388FF',
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
    ...fixedRateRepayment(loan, (25 * 12 - loan.payments) / 12)
  }),
  GRADUATED: loan => ({
    label: 'Graduated',
    color: '#FF2A00',
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
    ...graduatedRepayment(loan, (10 * 12 - loan.payments) / 12)
  }),
  GRADUATED_EXTENDED: loan => ({
    label: 'Graduated Extended',
    color: '#FF9400',
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
    ...graduatedRepayment(loan, (25 * 12 - loan.payments) / 12)
  })
}
