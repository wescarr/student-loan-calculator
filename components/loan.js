import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import PropTypes from 'prop-types'
import React, {useCallback, useEffect, useState} from 'react'
import {Types} from '../shared/loan_config'
import {onChangeNumber} from '../shared/helpers'

const Loan = props => {
  const [balance, setBalance] = useState(60000)
  const [rate, setRate] = useState(5)
  const [type, setType] = useState(Types.DIRECT_SUBSIDIZED)

  useEffect(() => {
    if (balance && rate && type) {
      props.onChange({balance, rate: rate / 100, type})
    }
  }, [balance, rate, type])

  const onBalanceChange = useCallback(onChangeNumber(setBalance), [setBalance])
  const onRateChange = useCallback(onChangeNumber(setRate), [setRate])
  const onTypeChange = e => setType(e.target.value)

  return (
    <div>
      <Form>
        <Form.Group>
          <Form.Label>What kind of loan do you have?</Form.Label>
          <InputGroup>
            <Form.Control value={type} as="select" onChange={onTypeChange}>
              <option disabled value="">
                Select a loan type
              </option>
              {Object.entries(Types).map(([id, name]) => (
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
                value={balance}
                type="number"
                onChange={onBalanceChange}
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
                value={rate}
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
