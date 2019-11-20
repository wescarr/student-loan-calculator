import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Caret from '../components/caret'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import PaymentSummary from './payment_summary'
import PropTypes from 'prop-types'
import React, {useCallback, useEffect, useState} from 'react'
import Table from 'react-bootstrap/Table'
import chartImg from '../images/chart-area.svg'
import css from 'styled-jsx/css'
import ellipsisImg from '../images/ellipsis-h.svg'
import settingsImg from '../images/sliders-v-square.svg'
import {asFloat, useDeferredOnChange} from '@standardlabs/react-hooks'

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

const getCompareRange = (repayments, compare) => {
  const values = repayments
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
  const {id, label, sort, onClick, ...rest} = props
  return (
    <th onClick={() => onClick(id)} {...rest}>
      <span>{label}</span>
      {sort && sort.key === id ? <Caret dir={sort.dir} /> : null}
      <style jsx>{`
        th span {
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

const PaymentTable = ({payments, selected, onSelect, rates, onRatesChange}) => {
  const [sort, setSort] = useState()
  const [compare, setCompare] = useState('totalPayment')
  const [incomeGrowth, setIncomeGrowth] = useDeferredOnChange(
    rates.income * 100,
    150,
    asFloat
  )
  const [inflationRate, setInflationRate] = useDeferredOnChange(
    rates.inflation * 100,
    150,
    asFloat
  )

  useEffect(() => {
    onRatesChange({
      income: incomeGrowth.deferred / 100,
      inflation: inflationRate.deferred / 100
    })
  }, [incomeGrowth.deferred, inflationRate.deferred])

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
    .btn-group {
      right: 16px;
      top: 4px;
    }

    .btn-group .dropdown-toggle::after {
      display: none;
    }
  `

  return (
    <div>
      <Table borderless striped>
        <thead className="position-relative">
          <tr>
            <th>
              <img src={chartImg} width="19px" />
            </th>
            <th>Plan</th>
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
              colSpan={2}
            />
            <TableHeading
              label={
                {
                  totalInterest: 'Total interest',
                  totalPayment: 'Total paid',
                  forgiven: 'Forgiven'
                }[compare]
              }
              onClick={onSortClick}
              id={compare}
              sort={sort}
              colSpan={2}></TableHeading>
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
      <ButtonGroup className={`position-absolute ${className}`}>
        <Dropdown alignRight as={ButtonGroup} onSelect={setCompare}>
          <Dropdown.Toggle variant="secondary" className={className}>
            <img src={ellipsisImg} width="19px" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="totalPayment">Total paid</Dropdown.Item>
            <Dropdown.Item eventKey="totalInterest">
              Total interest
            </Dropdown.Item>
            <Dropdown.Item eventKey="forgiven">Forgiven</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown alignRight as={ButtonGroup} onSelect={setCompare}>
          <Dropdown.Toggle variant="secondary" className={className}>
            <img src={settingsImg} width="19px" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>
              <Form.Group>
                <Form.Label>Annual income growth</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    min={1}
                    step={0.1}
                    value={incomeGrowth.value}
                    onChange={setIncomeGrowth}
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
              </Form.Group>
              <Form.Group>
                <Form.Label>Annual inflation rate</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    min={1}
                    step={0.01}
                    value={inflationRate.value}
                    onChange={setInflationRate}
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
              </Form.Group>
            </Dropdown.Header>
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
      {styles}
    </div>
  )
}

PaymentTable.propTypes = {
  payments: PropTypes.array.isRequired,
  selected: PropTypes.array,
  onSelect: PropTypes.func,
  rates: PropTypes.object,
  onRatesChange: PropTypes.func
}

export default PaymentTable
