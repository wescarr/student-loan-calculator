import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import PropTypes from 'prop-types'
import React, {useEffect} from 'react'
import {States} from '../shared/calc'
import {TaxFilingStatus} from '../shared/loan_config'

import {
  asInt,
  useDeferredOnChange,
  useOnChange,
} from '@standardlabs/react-hooks'

const IncomeForm = ({onChange, ...props}) => {
  const [income, onChangeIncome] = useDeferredOnChange(45000, 150, asInt)
  const [dependents, onChangeDependants] = useOnChange(1, asInt)
  const [state, onChangeState] = useOnChange(States.LOWER_48)
  const [filing, onChangeFiling] = useOnChange(TaxFilingStatus.SINGLE)

  useEffect(() => {
    if (income.deferred && dependents && state && filing) {
      onChange({income: income.deferred, dependents, state, filing})
    }
  }, [onChange, income.deferred, dependents, state, filing])

  return (
    <Form {...props}>
      <Form.Row>
        <Col>
          <Form.Group>
            <Form.Label>Adjusted Gross Income</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                placeholder="50000"
                value={income.value}
                type="number"
                onChange={onChangeIncome}
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>State</Form.Label>
            <Form.Control as="select" onChange={onChangeState} value={state}>
              <option value={States.LOWER_48}>Lower 48</option>
              <option value={States.ALASKA}>Alaska</option>
              <option value={States.HAWAII}>Hawaii</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Form.Row>
      <Form.Row>
        <Col>
          <Form.Group>
            <Form.Label>Family Size</Form.Label>
            <Form.Control
              as="select"
              onChange={onChangeDependants}
              value={dependents}>
              {new Array(15).fill(1).map((value, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Tax Filing Status</Form.Label>
            <Form.Control as="select" onChange={onChangeFiling} value={filing}>
              {Object.entries(TaxFilingStatus).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Form.Row>
    </Form>
  )
}

IncomeForm.propTypes = {
  onChange: PropTypes.func
}

export default IncomeForm
