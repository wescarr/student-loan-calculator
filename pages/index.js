import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Head from 'next/head'
import Loan from '../components/loan'
import PropTypes from 'prop-types'
import React, {useState} from 'react'
import Row from 'react-bootstrap/Row'
import dynamic from 'next/dynamic'
import {currency} from '../shared/helpers'
import {fixedRateRepayment, graduatedRepayment} from '../shared/calc'

const Chart = dynamic(import('react-chartjs-2').then(mod => mod.Bar))

const getYearBreakdown = (breakdown, attr) => {
  const years = []
  for (let i = 12; i <= breakdown.length; i += 12) {
    years.push(breakdown[i - 1][attr])
  }

  return years
}

const PaymentSummary = props => {
  const {variant, title, breakdown} = props
  const [first] = breakdown
  const last = breakdown[breakdown.length - 1]

  return (
    <Alert variant={variant} className="text-center">
      {title} ({Math.round(breakdown.length / 12)} years)
      <div className="d-flex flex-row mt-2">
        <div className="w-50 border-right border-white">
          {first.payment === last.payment ? (
            <h5 className="mb-0">{currency(first.payment)}</h5>
          ) : (
            <h5 className="mb-0">
              {currency(first.payment)} - {currency(last.payment)}
            </h5>
          )}
          Per month
        </div>
        <div className="w-50">
          <h5 className="mb-0">{currency(last.totalInterest)}</h5> Total
          interest
        </div>
      </div>
    </Alert>
  )
}

PaymentSummary.propTypes = {
  variant: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  breakdown: PropTypes.array.isRequired
}

const Home = () => {
  const [loan, setLoan] = useState()

  let fixed, extended, graduated, graduatedExtended, chartData, chartOptions
  if (loan) {
    fixed = fixedRateRepayment(loan)
    extended = fixedRateRepayment(loan, 25)
    graduated = graduatedRepayment(loan)
    graduatedExtended = graduatedRepayment(loan, 25)

    const dataset = (label, data, color, bgColor) => ({
      label,
      data,
      fill: false,
      lineTension: 0.1,
      backgroundColor: bgColor,
      borderColor: color,
      borderWidth: 1,
      pointRadius: 0,
      pointHoverBackgroundColor: color,
      pointHitRadius: 5
    })

    chartOptions = {
      legend: {display: false},
      scales: {
        yAxes: [
          {
            ticks: {
              suggestedMin: 0,
              suggestedMax: 200
            }
          }
        ]
      },
      tooltips: {
        displayColors: false,
        callbacks: {
          label: (item, data) =>
            `${data.datasets[item.datasetIndex].label}: ${currency(
              item.yLabel
            )}`
        }
      }
    }

    chartData = {
      labels: extended.breakdown.slice(0, 25).map((r, i) => `${i + 1}`),
      datasets: [
        dataset(
          'Standard Fixed',
          getYearBreakdown(fixed.breakdown, 'totalPayment'),
          '#004085',
          '#cce5ff'
        ),
        dataset(
          'Graduated',
          getYearBreakdown(graduated.breakdown, 'totalPayment'),
          '#856404',
          '#fff3cd'
        ),
        dataset(
          'Fixed Extended',
          getYearBreakdown(extended.breakdown, 'totalPayment'),
          '#155724',
          '#d4edda'
        ),
        dataset(
          'Graduated Extended',
          getYearBreakdown(graduatedExtended.breakdown, 'totalPayment'),
          '#721c24',
          '#f8d7da'
        )
      ]
    }
  }

  return (
    <>
      <Head>
        <title>Student Loan Calculator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            <div className="text-center mt-5 mb-4">
              <h1 className="display-4">Student Loan Calculator</h1>
              <p className="lead">
                Find the best options for repaying your student loans
              </p>
            </div>
            <div className="shadow rounded p-3 mb-4">
              <Loan onChange={setLoan} />
            </div>
            {loan && (
              <>
                <Form.Row>
                  <Col xs={12} sm={6}>
                    <PaymentSummary
                      title="Standard Fixed"
                      variant="primary"
                      {...fixed}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <PaymentSummary
                      title="Extended Fixed"
                      variant="success"
                      {...extended}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <PaymentSummary
                      title="Graduated"
                      variant="warning"
                      {...graduated}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <PaymentSummary
                      title="Graduated Extended"
                      variant="danger"
                      {...graduatedExtended}
                    />
                  </Col>
                </Form.Row>
                {chartData && <Chart data={chartData} options={chartOptions} />}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Home
