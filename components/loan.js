import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import PropTypes from 'prop-types'
import Select from './select'
import React, {useEffect} from 'react'
import {LoanTypes} from '../shared/loan_config'
import {
  asFloat,
  asInt,
  useDeferredOnChange,
  useOnChange
} from '@standardlabs/react-hooks'

const Loan = ({onChange, ...props}) => {
  const [balance, onBalanceChange] = useDeferredOnChange(60000, 150, asInt)
  const [rate, onRateChange] = useDeferredOnChange(5, 150, asFloat)
  const [type, onTypeChange] = useOnChange('DIRECT_SUBSIDIZED')
  const [plan, onPlanChange] = useOnChange('')
  const [payments, onPaymentsChange] = useDeferredOnChange(0, 150, asInt)

  useEffect(() => {
    if (balance.deferred && rate.deferred && type) {
      onChange({
        balance: balance.deferred,
        rate: rate.deferred / 100,
        type,
        payments: payments.deferred || 0,
        plan
      })
    }
  }, [onChange, balance.deferred, rate.deferred, type, payments.deferred, plan])

  return (
    <div {...props}>
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
        <Col xs={12} md={6}>
          <Form.Group>
            <Form.Label>Current balance & Interest rate</Form.Label>
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
        <Col xs={12} md={6}>
          <Form.Group>
            <Form.Label>Number of payments made</Form.Label>
            <InputGroup>
              <Form.Control
                value={payments.value}
                onChange={onPaymentsChange}
                type="number"
                placeholder="0"
                min={0}
                max={300}
              />
              <Select value={plan} onChange={onPlanChange}>
                <option value="" disabled>
                  Payment plan
                </option>
                <option value="Standard Fixed">Standard Fixed</option>
                <option value="Fixed Extended">Fixed Extended</option>
                <option value="Graduated">Graduated</option>
                <option value="Graduated Extended">Graduated Extended</option>
                <option value="Income">Income Driven Plan</option>
              </Select>
            </InputGroup>
          </Form.Group>
        </Col>
      </Form.Row>
    </div>
  )
}

Loan.propTypes = {
  onChange: PropTypes.func
}

export default Loan
