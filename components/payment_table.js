import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Caret from '../components/caret'
import ChartImg from '../images/chart-area.svg'
import Dropdown from 'react-bootstrap/Dropdown'
import EllipsisImg from '../images/ellipsis-h.svg'
import PaymentSummary from './payment_summary'
import PropTypes from 'prop-types'
import React, {useCallback, useState} from 'react'
import Table from 'react-bootstrap/Table'
import css from 'styled-jsx/css'

const getPaymentsRange = repayments => {
  repayments = repayments.filter(r => r.eligible)
  const first = repayments.map(r => r.breakdown[0].payment)
  const last = repayments.map(r => r.breakdown[r.breakdown.length - 1].payment)

  const range = {
    min: Math.min(...first),
    max: Math.max(...last)
  }

  range.delta = range.max - range.min

  return range
}

const getCompareRange = (repayments, compare) => {
  const values = repayments
    .filter(r => r.eligible)
    .map(r =>
      compare === 'forgiven'
        ? r.forgiven || 0
        : r.breakdown[r.breakdown.length - 1][compare]
    )
    .sort((a, b) => a - b)

  const range = {
    min: values[0],
    max: values[values.length - 1]
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
  const {id, sort, children, ...rest} = props

  const caret = sort && sort.key === id ? <Caret dir={sort.dir} /> : null
  const variant = caret ? 'secondary' : 'light'

  return <th {...rest}>{children(caret, variant)}</th>
}

TableHeading.propTypes = {
  id: PropTypes.string,
  children: PropTypes.any,
  sort: PropTypes.object
}

const PaymentTable = ({payments, selected, onSelect}) => {
  const [sort, setSort] = useState()
  const [compare, setCompare] = useState('totalPayment')

  const range = getPaymentsRange(payments)
  const compareRange = getCompareRange(payments, compare)

  const onSortClick = useCallback(
    key =>
      setSort({
        key,
        dir: sort && key === sort.key && sort.dir === 'down' ? 'up' : 'down'
      }),
    [sort]
  )

  const {className, styles} = css.resolve`
    .btn-group .dropdown-toggle::after {
      display: none;
    }
  `

  const compareItems = [
    {id: 'totalPayment', label: 'Total paid'},
    {id: 'totalInterest', label: 'Total interest'},
    {id: 'forgiven', label: 'Forgiven'}
  ]

  return (
    <div>
      <Table borderless striped>
        <thead className="position-relative">
          <tr>
            <th className="align-middle">
              <ChartImg width="19px" />
            </th>
            <th className="align-middle">Plan</th>
            <TableHeading id="term" sort={sort}>
              {(caret, variant) => (
                <Button
                  className="font-weight-bold"
                  variant={variant}
                  onClick={() => onSortClick('term')}>
                  Term {caret}
                </Button>
              )}
            </TableHeading>
            <TableHeading
              id="payment"
              sort={sort}
              colSpan={2}
              className="text-center">
              {(caret, variant) => (
                <Button
                  className="font-weight-bold"
                  variant={variant}
                  onClick={() => onSortClick('payment')}>
                  Per month {caret}
                </Button>
              )}
            </TableHeading>
            <TableHeading
              id={compare}
              sort={sort}
              colSpan={2}
              className="text-center">
              {(caret, variant) => (
                <ButtonGroup className={`mr-1 ${className}`}>
                  <Button
                    className="font-weight-bold"
                    onClick={() => onSortClick(compare)}
                    variant={variant}>
                    {
                      {
                        totalInterest: 'Total interest',
                        totalPayment: 'Total paid',
                        forgiven: 'Forgiven'
                      }[compare]
                    }{' '}
                    {caret}
                  </Button>
                  <Dropdown alignRight as={ButtonGroup} onSelect={setCompare}>
                    <Dropdown.Toggle variant={variant} className={className}>
                      <EllipsisImg
                        width="19px"
                        fill={variant === 'light' ? '#333' : '#fff'}
                      />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {compareItems.map(({id, label}) => (
                        <Dropdown.Item
                          key={id}
                          eventKey={id}
                          active={compare === id}>
                          {label}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </ButtonGroup>
              )}
            </TableHeading>
          </tr>
        </thead>
        <tbody>
          {sortRepayments(payments, sort).map(r => (
            <PaymentSummary
              {...r}
              range={range}
              compareRange={compareRange}
              key={r.label}
              compare={compare}
              selected={selected.includes(r.label)}
              onClick={() => onSelect(r.label)}
            />
          ))}
        </tbody>
      </Table>
      {styles}
    </div>
  )
}

PaymentTable.propTypes = {
  payments: PropTypes.array.isRequired,
  selected: PropTypes.array,
  onSelect: PropTypes.func
}

export default PaymentTable
