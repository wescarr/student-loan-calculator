import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import PropTypes from 'prop-types'
import Select from './select'
import React, {useCallback, useEffect} from 'react'
import {LoanTypes} from '../shared/loan_config'
import {
  asFloat,
  asInt,
  useDeferredOnChange,
  useOnChange
} from '@standardlabs/react-hooks'
import {currency} from '../shared/helpers'

const Close = props => (
  <button className="close" {...props}>
    <span aria-hidden="true">&times;</span>
  </button>
)

const Summary = ({loan, onClick, onClose, ...props}) => {
  const onRemove = useCallback(() => onClose(loan.id), [loan.id, onClose])
  const onExpand = useCallback(() => onClick(loan.id), [loan.id, onClick])

  return (
    <div
      {...props}
      className="border-bottom p-2 mb-3 bg-light"
      onClick={onExpand}>
      {LoanTypes[loan.type]}
      <br />
      {currency(loan.balance)} at {loan.rate * 100}%{' '}
      <Close onClick={onRemove} />
    </div>
  )
}

Summary.propTypes = {
  loan: PropTypes.object,
  onClick: PropTypes.func,
  onClose: PropTypes.func
}

const Loan = ({onChange, onClick, onRemove, loan, ...props}) => {
  const [balance, onBalanceChange] = useDeferredOnChange(
    loan.balance,
    150,
    asInt
  )
  const [rate, onRateChange] = useDeferredOnChange(
    loan.rate * 100,
    150,
    asFloat
  )
  const [type, onTypeChange] = useOnChange(loan.type)
  const [plan, onPlanChange] = useOnChange(loan.plan)
  const [payments, onPaymentsChange] = useDeferredOnChange(
    loan.payments,
    150,
    asInt
  )

  useEffect(() => {
    if (balance.deferred && rate.deferred && type) {
      onChange(loan.id, {
        balance: balance.deferred,
        rate: rate.deferred / 100,
        type,
        payments: payments.deferred || 0,
        plan
      })
    }
  }, [
    loan.id,
    onChange,
    balance.deferred,
    rate.deferred,
    type,
    payments.deferred,
    plan
  ])

  return (
    <div {...props}>
      {loan.expanded ? (
        <>
          <Form>
            <Form.Group>
              <Form.Label>What kind of loan do you have?</Form.Label>
              <InputGroup>
                <Select value={type} onChange={onTypeChange}>
                  <option disabled value="">
                    Select a loan type
                  </option>
                  {Object.entries(LoanTypes).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                  <option value="unknown">I don&apos;t know</option>
                </Select>
              </InputGroup>
            </Form.Group>
          </Form>
          <Form.Row>
            <Col>
              <Form.Group>
                <Form.Label>Current balance</Form.Label>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>$</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    placeholder="40,000"
                    value={balance.value}
                    type="number"
                    onChange={onBalanceChange}
                    min={1000}
                    step={1000}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Interest rate</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    placeholder="5"
                    onChange={onRateChange}
                    value={rate.value}
                    min={1}
                    max={10}
                    step={0.1}
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
              </Form.Group>
            </Col>
          </Form.Row>
          <Form.Row>
            <Col>
              <Form.Group>
                <Form.Label>Number of payments made</Form.Label>
                <Form.Control
                  value={payments.value}
                  onChange={onPaymentsChange}
                  type="number"
                  placeholder="0"
                  min={0}
                  max={300}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Repayment plan</Form.Label>
                <Select value={plan} onChange={onPlanChange}>
                  <option value="" disabled>
                    Select a plan
                  </option>
                  <option value="Standard Fixed">Standard Fixed</option>
                  <option value="Fixed Extended">Fixed Extended</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Graduated Extended">Graduated Extended</option>
                  <option value="Income">Income Driven Plan</option>
                </Select>
              </Form.Group>
            </Col>
          </Form.Row>
        </>
      ) : (
        <Summary loan={loan} onClick={onClick} onClose={onRemove} />
      )}
    </div>
  )
}

Loan.propTypes = {
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  onClick: PropTypes.func,
  loan: PropTypes.object
}

export default Loan
