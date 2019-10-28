import Alert from 'react-bootstrap/Alert'
import Badge from 'react-bootstrap/Badge'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Head from 'next/head'
import IncomeForm from '../components/income_form'
import Loan from '../components/loan'
import PropTypes from 'prop-types'
import React, {useState} from 'react'
import Row from 'react-bootstrap/Row'
import dynamic from 'next/dynamic'
import {currency} from '../shared/helpers'
import {fixedRateRepayment, graduatedRepayment} from '../shared/calc'
import {Types} from '../shared/loan_config'

const Chart = dynamic(import('react-chartjs-2').then(mod => mod.Bar))

const getYearBreakdown = (breakdown, attr) => {
  const years = []
  for (let i = 12; i <= breakdown.length; i += 12) {
    years.push(breakdown[i - 1][attr])
  }

  return years
}

const dataset = (label, data, bgColor) => ({
  label,
  data,
  fill: false,
  lineTension: 0.1,
  backgroundColor: bgColor,
  borderWidth: 0
})

const getChartData = (repayments, attr) => {
  return {
    labels: repayments[0].breakdown.slice(0, 25).map((r, i) => `${i + 1}`),
    datasets: repayments.map(r =>
      dataset(r.label, getYearBreakdown(r.breakdown, attr), r.color)
    )
  }
}

const PaymentSummary = props => {
  const {color, label, breakdown} = props
  const [first] = breakdown
  const last = breakdown[breakdown.length - 1]

  return (
    <Alert variant="secondary" className="text-center position-relative">
      <div className="position-absolute border border-white rounded-circle d-inline-block" />
      <span>
        {label} ({Math.round(breakdown.length / 12)} years)
      </span>
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
      <style jsx>{`
        div.rounded-circle {
          background-color: ${color};
          width: 15px;
          height: 15px;
          top: 10px;
          left: 10px;
        }
      `}</style>
    </Alert>
  )
}

PaymentSummary.propTypes = {
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  breakdown: PropTypes.array.isRequired
}

const Home = () => {
  const [loan, setLoan] = useState()
  const [income, setIncome] = useState()
  const [editIncome, setEditIncome] = useState(false)
  const [chartType, setChartType] = useState('endingBalance')

  const isUnkownLoan = loan && !Types[loan.type]

  let repayments, chartData, chartOptions
  if (loan) {
    repayments = [
      {label: 'Standard Fixed', color: '#06FF54', ...fixedRateRepayment(loan)},
      {label: 'Graduated', color: '#1388FF', ...fixedRateRepayment(loan, 25)},
      {label: 'Fixed Extended', color: '#FF2A00', ...graduatedRepayment(loan)},
      {
        label: 'Graduated Extended',
        color: '#FF9400',
        ...graduatedRepayment(loan, 25)
      }
    ]

    chartOptions = {
      legend: {display: false},
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              min: 0,
              suggestedMax: 200 // Calculate this
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
            )}`,
          title: item => `Year ${item[0].label}`
        }
      }
    }

    chartData = getChartData(repayments, chartType)
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
            <div className="shadow rounded mb-4">
              <div className="px-3 pt-3 pb-1">
                <Loan onChange={setLoan} />
              </div>
              <div className="bg-light px-3 py-2 rounded-bottom">
                {editIncome ? (
                  <IncomeForm onChange={setIncome} />
                ) : (
                  <small
                    className="text-muted"
                    onClick={() => setEditIncome(true)}>
                    <Badge
                      variant="secondary"
                      className="rounded-circle p-0"
                      onClick={() => setEditIncome(true)}>
                      <span className="plus">+</span>
                    </Badge>{' '}
                    Enter your income to see additional options
                  </small>
                )}
              </div>
            </div>
            {loan && !isUnkownLoan && (
              <>
                <Form.Row>
                  {repayments.map(r => (
                    <Col key={r.label} xs={12} sm={6}>
                      <PaymentSummary {...r} />
                    </Col>
                  ))}
                </Form.Row>
                {chartData && (
                  <>
                    <div className="my-2 text-center">
                      <ToggleButtonGroup
                        type="radio"
                        name="chart_type"
                        value={chartType}
                        onChange={setChartType}>
                        <ToggleButton value={'payment'} variant="secondary">
                          Monthly Payment
                        </ToggleButton>
                        <ToggleButton
                          value={'endingBalance'}
                          variant="secondary">
                          Balance
                        </ToggleButton>
                        <ToggleButton
                          value={'totalPayment'}
                          variant="secondary">
                          Total Paid
                        </ToggleButton>
                        <ToggleButton
                          value={'totalInterest'}
                          variant="secondary">
                          Total Interest
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </div>
                    <Chart data={chartData} options={chartOptions} />
                  </>
                )}
              </>
            )}
            {isUnkownLoan && (
              <p className="text-center p-3">
                Instruction here on what to do if you don&apos;t know your loan
                type
              </p>
            )}
          </Col>
        </Row>
      </Container>
      <style jsx>{`
        small.text-muted {
          cursor: pointer;
        }

        .plus {
          font-size: 20px;
          line-height: 1em;
          display: block;
          padding: 0 5px 3px;
        }
      `}</style>
    </>
  )
}

export default Home
