import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Head from 'next/head'
import InputGroup from 'react-bootstrap/InputGroup'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import Table from 'react-bootstrap/Table'
import {currency, onChangeNumber} from '../shared/helpers'
import {getLoanPaymentBreakdown} from '../shared/calc'

const updateChart = (breakdown, chartRef) => {
  if (!breakdown.length || !(window.google && google.visualization.DataTable)) {
    return
  }

  const data = new google.visualization.DataTable()
  data.addColumn('number', 'Payment')
  data.addColumn('number', 'Balance')
  data.addColumn('number', 'Interest')

  data.addRows(
    breakdown.map((r, i) => {
      return [i + 1, r.endingBalance, r.totalInterest]
    })
  )

  const options = {
    chart: {},
    height: 300,
    legend: {position: 'none'},
    series: {
      0: {lineWidth: 1},
      1: {lineWidth: 10, lineDashStyle: [4, 4]}
    },
    colors: ['#004085', '#721c24'],
    axis: {
      x: {
        0: {position: 'none', label: ''}
      }
    },
    hAxis: {
      title: '',
      viewWindow: {max: breakdown.length, min: 1},
      viewWindowMode: 'maximized'
    }
  }

  const chart = new google.charts.Line(chartRef.current)
  chart.draw(data, google.charts.Line.convertOptions(options))
}

const LoanRepayment = props => {
  const [balance, setBalance] = useState('')
  const [rate, setRate] = useState('')
  const [term, setTerm] = useState('')
  const chartRef = useRef(null)

  const onBalanceChange = useCallback(onChangeNumber(setBalance), [setBalance])
  const onRateChange = useCallback(onChangeNumber(setRate), [setRate])
  const onTermChange = useCallback(onChangeNumber(setTerm), [setTerm])

  const breakdown =
    balance && rate && term
      ? getLoanPaymentBreakdown(balance, rate / 100, 12, term)
      : []
  const [{payment} = {}] = breakdown

  useEffect(() => {
    updateChart(breakdown, chartRef)
  }, [breakdown])

  useEffect(() => {
    const handler = () => updateChart(breakdown, chartRef)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [breakdown])

  return (
    <div {...props}>
      <Head>
        <script
          type="text/javascript"
          src="https://www.gstatic.com/charts/loader.js"
        />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
        google.charts.load('current', {'packages':['line']});
        `
          }}
        />
      </Head>
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
          <div className="mx-0 mt-2 mb-3" ref={chartRef} />
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
