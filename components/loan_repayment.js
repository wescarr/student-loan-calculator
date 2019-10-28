import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Head from 'next/head'
import InputGroup from 'react-bootstrap/InputGroup'
import React, {useCallback, useState} from 'react'
import Table from 'react-bootstrap/Table'
import dynamic from 'next/dynamic'
import {currency, onChangeNumber} from '../shared/helpers'
import {getLoanPaymentBreakdown} from '../shared/calc'

const Line = dynamic(import('react-chartjs-2').then(mod => mod.Line))

const LoanRepayment = props => {
  const [balance, setBalance] = useState(100000)
  const [rate, setRate] = useState(5)
  const [term, setTerm] = useState(10)

  const onBalanceChange = useCallback(onChangeNumber(setBalance), [setBalance])
  const onRateChange = useCallback(onChangeNumber(setRate), [setRate])
  const onTermChange = useCallback(onChangeNumber(setTerm), [setTerm])

  const breakdown =
    balance && rate && term
      ? getLoanPaymentBreakdown(balance, rate / 100, 12, term)
      : []

  const [{payment} = {}] = breakdown

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
              value={balance}
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
          <Table striped size="sm" className="small text-right">
            <thead className="thead-light">
              <tr>
                <th className="sticky-top">#</th>
                <th className="sticky-top">Balance</th>
                <th className="sticky-top">Payment</th>
                <th className="sticky-top">Interest</th>
                <th className="sticky-top">Principle</th>
                <th className="sticky-top">Ending Balance</th>
                <th className="sticky-top">Total Interest</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{currency(r.balance)}</td>
                  <td>{currency(r.payment)}</td>
                  <td>{currency(r.interest)}</td>
                  <td>{currency(r.principle)}</td>
                  <td>{currency(r.endingBalance)}</td>
                  <td>{currency(r.totalInterest)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  )
}

export default LoanRepayment
