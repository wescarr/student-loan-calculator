import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import React from 'react'
import Row from 'react-bootstrap/Row'
import {currency} from '../shared/helpers'
import {getDiscretionaryIncome, States} from '../shared/calc'
import {useOnChange, asInt} from '@standardlabs/react-hooks'

const DiscretionaryIncome = props => {
  const [income, onChangeIncome] = useOnChange(50000, asInt)
  const [dependents, onChangeDependants] = useOnChange(1, asInt)
  const [state, onChangeState] = useOnChange(States.LOWER_48)

  const total =
    income &&
    getDiscretionaryIncome({
      agi: income,
      dependents,
      state,
      rates: {income: 0.03, inflation: 0.0236}
    })

  return (
    <div {...props}>
      <h2 className="text-center my-5">Discretionary Income Calculator</h2>
      <Form>
        <Form.Group>
          <Form.Label>Adjusted Gross Income</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>$</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              placeholder="50000"
              value={income}
              type="number"
              onChange={onChangeIncome}
            />
          </InputGroup>
          <Form.Text className="text-muted">
            This is your taxable income from your most recent tax return.
          </Form.Text>
        </Form.Group>
        <Row>
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
              <Form.Label>State</Form.Label>
              <Form.Control as="select" onChange={onChangeState} value={state}>
                <option value={States.LOWER_48}>Lower 48</option>
                <option value={States.ALASKA}>Alaska</option>
                <option value={States.HAWAII}>Hawaii</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
      </Form>
      {income && <h1 className="text-center">{currency(total)}</h1>}
    </div>
  )
}

export default DiscretionaryIncome
