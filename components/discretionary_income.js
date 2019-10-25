import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import React, {useCallback, useState} from 'react'
import Row from 'react-bootstrap/Row'
import {getDiscretionaryIncome, States} from '../shared/calc'

const onChangeNumber = set => ({target: {value}}) =>
  set(value ? parseInt(value, 10) : '')

const DiscretionaryIncome = props => {
  const [income, setIncome] = useState('')
  const onChangeIncome = useCallback(onChangeNumber(setIncome), [setIncome])

  const [dependents, setDependents] = useState(1)
  const onChangeDependants = useCallback(onChangeNumber(setDependents), [
    setDependents
  ])

  const [state, setState] = useState(States.LOWER_48)
  const onChangeState = useCallback(({target: {value}}) => setState(value), [
    setState
  ])

  const total = income && getDiscretionaryIncome(income, dependents, state)

  return (
    <div {...props}>
      <h2>Discretionary Income Calculator</h2>
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
      {income && <h1>${total.toLocaleString()}</h1>}
      <style jsx>{`
        h1,
        h2 {
          text-align: center;
        }

        h2 {
          margin: 40px 0;
        }
      `}</style>
    </div>
  )
}

export default DiscretionaryIncome
