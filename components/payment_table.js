import PropTypes from 'prop-types'
import React from 'react'
import Table from 'react-bootstrap/Table'
import {currency} from '../shared/helpers'

const PaymentTable = ({payments}) => (
  <Table striped size="sm" className="small text-right">
    <thead className="thead-light">
      <tr>
        <th className="sticky-top">#</th>
        <th className="sticky-top">Balance</th>
        <th className="sticky-top">Payment</th>
        <th className="sticky-top">Interest</th>
        <th className="sticky-top">Principle</th>
        <th className="sticky-top">Ending Balance</th>
        <th className="sticky-top">Total Interest</th>
      </tr>
    </thead>
    <tbody>
      {payments.map((r, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{currency(r.balance)}</td>
          <td>{currency(r.payment)}</td>
          <td>{currency(r.interest)}</td>
          <td>{currency(r.principle)}</td>
          <td>{currency(r.endingBalance)}</td>
          <td>{currency(r.totalInterest)}</td>
        </tr>
      ))}
    </tbody>
  </Table>
)

PaymentTable.propTypes = {
  payments: PropTypes.array.isRequired
}

export default PaymentTable
