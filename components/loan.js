import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import PropTypes from 'prop-types'
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

  useEffect(() => {
    if (balance.deferred && rate.deferred && type) {
      onChange({balance: balance.deferred, rate: rate.deferred / 100, type})
    }
  }, [onChange, balance.deferred, rate.deferred, type])

  return (
    <div {...props}>
      <Form>
        <Form.Group>
          <Form.Label>What kind of loan do you have?</Form.Label>
          <InputGroup>
            <Form.Control value={type} as="select" onChange={onTypeChange}>
              <option disabled value="">
                Select a loan type
              </option>
              {Object.entries(LoanTypes).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
              <option value="unknown">I don&apos;t know</option>
            </Form.Control>
          </InputGroup>
        </Form.Group>
      </Form>
      <Form.Row>
        <Col>
          <Form.Group>
            <Form.Label>Loan amount</Form.Label>
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
            <Form.Label>Annual interest rate</Form.Label>
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
    </div>
  )
}

Loan.propTypes = {
  onChange: PropTypes.func
}

export default Loan
