import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import PropTypes from 'prop-types'
import React, {useEffect} from 'react'
import {asFloat, useDeferredOnChange} from '@standardlabs/react-hooks'

const Settings = ({onChange, rates, ...props}) => {
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
    onChange({
      income: incomeGrowth.deferred / 100,
      inflation: inflationRate.deferred / 100
    })
  }, [incomeGrowth.deferred, inflationRate.deferred, onChange])

  return (
    <Form {...props}>
      <Form.Row>
        <Col>
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
        </Col>
        <Col>
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
        </Col>
      </Form.Row>
    </Form>
  )
}

Settings.propTypes = {
  rates: PropTypes.object,
  onChange: PropTypes.func
}

export default Settings