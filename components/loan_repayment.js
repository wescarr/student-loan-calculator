import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import PaymentTable from './payment_table'
import React from 'react'
import {Line} from 'react-chartjs-2'
import {currency} from '../shared/helpers'
import {getFixedPayment, getFixedBreakdown} from '../shared/calc'
import {
  asFloat,
  asInt,
  useDeferredOnChange,
  useOnChange
} from '@standardlabs/react-hooks'

const LoanRepayment = props => {
  const [balance, onBalanceChange] = useDeferredOnChange(10000, 150, asInt)
  const [rate, onRateChange] = useOnChange(5, asFloat)
  const [term, onTermChange] = useOnChange(10, asFloat)

  const payment =
    balance.deferred && rate && term
      ? getFixedPayment(balance.deferred, rate / 100, term)
      : undefined

  const breakdown = payment
    ? getFixedBreakdown(payment, balance.deferred, rate / 100, term)
    : []

  const options = {
    legend: {
      display: false
    },
    scales: {
      xAxes: [
        {
          ticks: {
            callback: (value, index) => (index % 2 === 0 ? value : null)
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            callback: (value, index) =>
              index % 2 === 0 ? `$${Math.round(value / 1000)}k` : null
          }
        }
      ]
    },
    tooltips: {
      displayColors: false,
      callbacks: {
        label: (item, data) =>
          `${data.datasets[item.datasetIndex].label}: ${currency(item.yLabel)}`
      }
    }
  }

  const dataset = (label, data, color) => ({
    label,
    data,
    fill: false,
    lineTension: 0.1,
    borderColor: color,
    borderWidth: 2,
    pointRadius: 0,
    pointHoverBackgroundColor: color,
    pointHitRadius: 5
  })

  const data = {
    labels: breakdown.map((r, i) => `Payment ${i + 1}`),
    datasets: [
      dataset('Balance', breakdown.map(r => r.balance), '#004085'),
      dataset('Interest', breakdown.map(r => r.totalInterest), '#721c24')
    ]
  }

  return (
    <div {...props}>
      <h2 className="text-center my-4">Loan Repayment Calculator</h2>
      <Form>
        <Form.Group>
          <Form.Label>Loan Amount</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>$</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              placeholder="50000"
              value={balance.value}
              type="number"
              onChange={onBalanceChange}
            />
          </InputGroup>
        </Form.Group>
        <Form.Row>
          <Col>
            <Form.Group>
              <Form.Label>Annual Interest Rate</Form.Label>
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
          <Col>
            <Form.Group>
              <Form.Label>Loan Term</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  placeholder="10"
                  onChange={onTermChange}
                  value={term}
                />
                <InputGroup.Append>
                  <InputGroup.Text>years</InputGroup.Text>
                </InputGroup.Append>
              </InputGroup>
            </Form.Group>
          </Col>
        </Form.Row>
      </Form>
      {payment && (
        <Form.Row>
          <Col xs={12} sm={6}>
            <Alert variant="primary" className="text-center">
              Monthly Payment
              <h1>{currency(payment)}</h1>
            </Alert>
          </Col>
          <Col xs={12} sm={6}>
            <Alert variant="danger" className="text-center">
              Total Interest
              <h1>{currency(breakdown[breakdown.length - 1].totalInterest)}</h1>
            </Alert>
          </Col>
        </Form.Row>
      )}
      {!!breakdown.length && (
        <>
          <div className="mx-0 mt-2 mb-3">
            <Line data={data} options={options} />
          </div>
          <PaymentTable payments={breakdown} />
        </>
      )}
    </div>
  )
}

export default LoanRepayment
