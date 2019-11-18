import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import PropTypes from 'prop-types'
import React, {useEffect} from 'react'
import Select from './select'
import {States} from '../shared/calc'
import {TaxFilingStatus} from '../shared/loan_config'

import {
  asInt,
  useDeferredOnChange,
  useOnChange
} from '@standardlabs/react-hooks'

const IncomeForm = ({onChange, income, ...props}) => {
  const [agi, onChangeAgi] = useDeferredOnChange(income.agi, 150, asInt)
  const [dependents, onChangeDependants] = useOnChange(income.dependents, asInt)
  const [state, onChangeState] = useOnChange(income.state)
  const [filing, onChangeFiling] = useOnChange(income.filing)

  useEffect(() => {
    if (agi.deferred && dependents && state && filing) {
      onChange({agi: agi.deferred, dependents, state, filing})
    }
  }, [onChange, agi.deferred, dependents, state, filing])

  return (
    <Form {...props}>
      <Form.Row>
        <Col>
          <Form.Group>
            <Form.Label>Adjusted gross income</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                placeholder="50000"
                value={agi.value}
                type="number"
                min={1000}
                step={5000}
                onChange={onChangeAgi}
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>State</Form.Label>
            <Select onChange={onChangeState} value={state}>
              <option value={States.LOWER_48}>Lower 48</option>
              <option value={States.ALASKA}>Alaska</option>
              <option value={States.HAWAII}>Hawaii</option>
            </Select>
          </Form.Group>
        </Col>
      </Form.Row>
      <Form.Row>
        <Col>
          <Form.Group>
            <Form.Label>Family size</Form.Label>
            <Select onChange={onChangeDependants} value={dependents}>
              {new Array(15).fill(1).map((value, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Tax filing status</Form.Label>
            <Select onChange={onChangeFiling} value={filing}>
              {Object.entries(TaxFilingStatus).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </Select>
          </Form.Group>
        </Col>
      </Form.Row>
    </Form>
  )
}

IncomeForm.propTypes = {
  onChange: PropTypes.func,
  income: PropTypes.object
}

export default IncomeForm
