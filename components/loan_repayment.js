import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Head from 'next/head'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import Table from 'react-bootstrap/Table'
import {getLoanPaymentBreakdown} from '../shared/calc'

const onChangeNumber = set => ({target: {value}}) =>
  set(value ? parseInt(value, 10) : '')

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

  var options = {
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
    window.onresize = () => {
      updateChart(breakdown, chartRef)
    }
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
      <h2>Loan Repayment Calculator</h2>
      <Form>
        <Form.Group>
          <label>Loan Amount</label>
          <input
            className="form-control"
            placeholder="$10,000"
            value={balance || ''}
            type="number"
            onChange={onBalanceChange}
          />
        </Form.Group>
        <Form.Row>
          <Col>
            <Form.Group>
              <label>Annual Interest Rate</label>
              <input
                type="number"
                className="form-control"
                placeholder="5%"
                onChange={onRateChange}
                value={rate}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <label>Loan Term</label>
              <input
                type="number"
                className="form-control"
                placeholder="10 years"
                onChange={onTermChange}
                value={term}
              />
            </Form.Group>
          </Col>
        </Form.Row>
      </Form>
      {payment && (
        <Form.Row>
          <Col xs={12} sm={6}>
            <Alert variant="primary" className="text-center">
              Monthly Payment
              <h1>
                {payment.toLocaleString(undefined, {
                  style: 'currency',
                  currency: 'USD'
                })}
              </h1>
            </Alert>
          </Col>
          <Col xs={12} sm={6}>
            <Alert variant="danger" className="text-center">
              Total Interest
              <h1>
                {breakdown[breakdown.length - 1].totalInterest.toLocaleString(
                  undefined,
                  {style: 'currency', currency: 'USD'}
                )}
              </h1>
            </Alert>
          </Col>
        </Form.Row>
      )}
      {!!breakdown.length && (
        <>
          <div className="chart" ref={chartRef} />
          <Table striped size="sm" className="small text-right">
            <thead className="thead-light">
              <tr>
                <th>#</th>
                <th>Balance</th>
                <th>Payment</th>
                <th>Interest</th>
                <th>Principle</th>
                <th>Ending Balance</th>
                <th>Total Interest</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.balance.toFixed(2)}</td>
                  <td>{r.payment.toFixed(2)}</td>
                  <td>{r.interest.toFixed(2)}</td>
                  <td>{r.principle.toFixed(2)}</td>
                  <td>{r.endingBalance.toFixed(2)}</td>
                  <td>{r.totalInterest.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
      <style jsx>{`
        h2 {
          text-align: center;
          margin: 40px 0;
        }

        .chart {
          margin: 10px 0 20px;
        }
      `}</style>
    </div>
  )
}

export default LoanRepayment
