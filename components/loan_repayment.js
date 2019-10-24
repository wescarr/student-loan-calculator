import React, {useCallback, useState} from 'react'
import {getLoanPaymentBreakdown} from '../shared/calc'

const onChangeNumber = set => ({target: {value}}) =>
  set(value ? parseInt(value, 10) : '')

const LoanRepayment = props => {
  const [balance, setBalance] = useState('')
  const [rate, setRate] = useState('')
  const [term, setTerm] = useState('')

  const onBalanceChange = useCallback(onChangeNumber(setBalance), [setBalance])
  const onRateChange = useCallback(onChangeNumber(setRate), [setRate])
  const onTermChange = useCallback(onChangeNumber(setTerm), [setTerm])

  const breakdown =
    balance && rate && term
      ? getLoanPaymentBreakdown(balance, rate / 100, 12, term)
      : []
  const [{payment} = {}] = breakdown

  return (
    <div {...props}>
      <h2>Loan Repayment Calculator</h2>
      <form className="form-row">
        <div className="form-group col-12">
          <label>Loan Amount</label>
          <input
            className="form-control"
            placeholder="$10,000"
            value={balance || ''}
            type="number"
            onChange={onBalanceChange}
          />
        </div>
        <div className="form-group col-6">
          <label>Annual Interest Rate</label>
          <input
            type="number"
            className="form-control"
            placeholder="5%"
            onChange={onRateChange}
            value={rate}
          />
        </div>
        <div className="form-group col-6">
          <label>Loan Term</label>
          <input
            type="number"
            className="form-control"
            placeholder="10 years"
            onChange={onTermChange}
            value={term}
          />
        </div>
      </form>
      {payment && (
        <div className="form-row">
          <div className="col-6">
            <div className="alert alert-primary text-center">
              Monthly Payment
              <h1>
                {payment.toLocaleString(undefined, {
                  style: 'currency',
                  currency: 'USD'
                })}
              </h1>
            </div>
          </div>
          <div className="col-6">
            <div className="alert alert-danger text-center">
              Total Interest
              <h1>
                {breakdown[breakdown.length - 1].totalInterest.toLocaleString(
                  undefined,
                  {style: 'currency', currency: 'USD'}
                )}
              </h1>
            </div>
          </div>
        </div>
      )}
      {!!breakdown.length && (
        <table className="table table-striped table-sm table-borderless small text-right">
          <thead className="thead-light">
            <tr>
              <th>#</th>
              <th>Balance</th>
              <th>Payment</th>
              <th>Interest</th>
              <th>Principle</th>
              <th>Ending Balance</th>
              <th>Total Interest</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.balance.toFixed(2)}</td>
                <td>{r.payment.toFixed(2)}</td>
                <td>{r.interest.toFixed(2)}</td>
                <td>{r.principle.toFixed(2)}</td>
                <td>{r.endingBalance.toFixed(2)}</td>
                <td>{r.totalInterest.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <style jsx>{`
        h2 {
          text-align: center;
          margin: 40px 0;
        }
      `}</style>
    </div>
  )
}

export default LoanRepayment
