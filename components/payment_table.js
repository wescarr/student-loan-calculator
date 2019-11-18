import Caret from '../components/caret'
import PaymentSummary from './payment_summary'
import PropTypes from 'prop-types'
import React, {useCallback, useState} from 'react'
import Table from 'react-bootstrap/Table'
import chartImg from '../images/chart-area.svg'

const getPaymentsRange = repayments => {
  const first = repayments.map(r => r.breakdown[0].payment)
  const last = repayments.map(r => r.breakdown[r.breakdown.length - 1].payment)

  const range = {
    min: Math.min(...first),
    max: Math.max(...last)
  }

  range.delta = range.max - range.min

  return range
}

const sortRepayments = (list, sort = {}) => {
  const {key, dir} = sort
  if (!key) {
    return list
  }

  return list.slice().sort((a, b) => {
    let aVal, bVal
    switch (key) {
      case 'term':
        aVal = a.breakdown.length
        bVal = b.breakdown.length
        break
      case 'payment':
        aVal = a.breakdown[0][key]
        bVal = b.breakdown[0][key]
        break
      case 'totalInterest':
      case 'totalPayment':
        aVal = a.breakdown[a.breakdown.length - 1][key]
        bVal = b.breakdown[b.breakdown.length - 1][key]
        break
      case 'forgiven':
        aVal = a[key] || 0
        bVal = b[key] || 0
    }

    if (!a.eligible) {
      aVal = dir === 'down' ? Number.POSITIVE_INFINITY : 0
    }

    if (!b.eligible) {
      bVal = dir === 'down' ? Number.POSITIVE_INFINITY : 0
    }

    return dir === 'down' ? aVal - bVal : bVal - aVal
  })
}

const TableHeading = props => {
  const {id, label, sort, onClick, ...rest} = props
  return (
    <th onClick={() => onClick(id)} {...rest}>
      <span>{label}</span>
      {sort && sort.key === id ? <Caret dir={sort.dir} /> : null}
      <style jsx>{`
        span {
          cursor: pointer;
        }
      `}</style>
    </th>
  )
}

TableHeading.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  sort: PropTypes.object,
  onClick: PropTypes.func
}

const PaymentTable = ({payments, income, selected, onSelect}) => {
  const [sort, setSort] = useState()
  const range = getPaymentsRange(payments)

  const onSortClick = useCallback(
    key =>
      setSort({
        key,
        dir: sort && key === sort.key && sort.dir === 'down' ? 'up' : 'down'
      }),
    [sort]
  )

  return (
    <Table borderless striped>
      <thead>
        <tr>
          <th>
            <img src={chartImg} />
          </th>
          <th>Repayment plan</th>
          <TableHeading
            label="Term"
            onClick={onSortClick}
            id="term"
            sort={sort}
          />
          <TableHeading
            label="Per month"
            onClick={onSortClick}
            id="payment"
            sort={sort}
          />
          <TableHeading
            className="text-right"
            label="Total interest"
            onClick={onSortClick}
            id="totalInterest"
            sort={sort}
          />
          <TableHeading
            className="text-right"
            label="Total paid"
            onClick={onSortClick}
            id="totalPayment"
            sort={sort}
          />
          {income ? (
            <TableHeading
              className="text-right"
              label="Forgiven"
              onClick={onSortClick}
              id="forgiven"
              sort={sort}
            />
          ) : null}
        </tr>
      </thead>
      <tbody>
        {sortRepayments(payments, sort).map(r => (
          <PaymentSummary
            {...r}
            income={income}
            range={range}
            key={r.label}
            selected={selected.includes(r.label)}
            onClick={() => onSelect(r.label)}
          />
        ))}
      </tbody>
    </Table>
  )
}

PaymentTable.propTypes = {
  payments: PropTypes.array.isRequired,
  selected: PropTypes.array,
  income: PropTypes.object,
  onSelect: PropTypes.func
}

export default PaymentTable
