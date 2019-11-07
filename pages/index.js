import Badge from 'react-bootstrap/Badge'
import Caret from '../components/caret'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Head from 'next/head'
import IncomeForm from '../components/income_form'
import Loan from '../components/loan'
import PropTypes from 'prop-types'
import React, {useCallback, useState} from 'react'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import dynamic from 'next/dynamic'
import {LoanTypes, RepaymentPlans as Plans} from '../shared/loan_config'
import {currency, hexToRgbA} from '../shared/helpers'
import {useToggle} from '@standardlabs/react-hooks'

const Chart = dynamic(import('react-chartjs-2').then(mod => mod.Bar))

const getYearBreakdown = (breakdown, attr) => {
  const years = []
  for (let i = 12; i <= breakdown.length; i += 12) {
    years.push(breakdown[i - 1][attr])
  }

  return years
}

const dataset = (label, data, bgColor, selected, anySelected) => ({
  label,
  data,
  fill: 'origin',
  lineTension: 0.1,
  borderColor: bgColor,
  backgroundColor: hexToRgbA(bgColor, selected ? 1 : anySelected ? 0.2 : 0.6),
  hoverBackgroundColor: hexToRgbA(bgColor, 1),
  borderWidth: 0,
  pointRadius: 0,
  pointHitRadius: 5,
  pointBackgroundColor: bgColor
})

const getChartData = (repayments, attr, selected) => {
  const datasets = repayments
    .filter(r => r.eligible)
    .map(r =>
      dataset(
        r.label,
        getYearBreakdown(r.breakdown, attr),
        r.color,
        r.label === selected,
        selected
      )
    )

  // Find largest data set to construct labels
  let max = 0
  datasets.forEach(d => {
    if (d.data.length > max) {
      max = d.data.length
    }
  })

  const data = {
    datasets,
    labels: new Array(max).fill(0).map((r, i) => `${i + 1}`)
  }

  return data
}

const PaymentSummary = props => {
  const {color, label, eligible, breakdown, forgiven, income, ...rest} = props
  const [first] = breakdown
  const last = breakdown[breakdown.length - 1]

  return (
    <tr className={`${!eligible ? 'text-muted' : ''}`} {...rest}>
      <td>
        <div className="border border-white rounded-circle d-inline-block" />
      </td>
      <td>{label}</td>
      {eligible ? (
        <>
          <td>{Math.round(breakdown.length / 12)} years</td>
          <td className="h6">
            {first.payment === last.payment
              ? `${currency(first.payment)}`
              : `${currency(first.payment)} - ${currency(last.payment)}`}
          </td>
          <td className="text-right h6">{currency(last.totalInterest)}</td>
          <td className="text-right h6">{currency(last.totalPayment)}</td>
          {income ? (
            <td className="text-right h6">{currency(forgiven || 0)}</td>
          ) : null}
        </>
      ) : (
        <td colSpan="5">
          Your loan type is not elgible for this repayment plan
        </td>
      )}
      <style jsx>{`
        div.rounded-circle {
          background-color: ${eligible ? color : '#d6d8db'};
          width: 15px;
          height: 15px;
        }
      `}</style>
    </tr>
  )
}

PaymentSummary.propTypes = {
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  breakdown: PropTypes.array.isRequired,
  eligible: PropTypes.bool.isRequired,
  forgiven: PropTypes.number,
  income: PropTypes.object
}

const sortRepayments = (list, sort) => {
  const {key, dir} = sort
  if (!key) {
    return list
  }

  return list.slice().sort((a, b) => {
    let aVal, bVal
    switch (key) {
      case 'term':
        aVal = a.breakdown.length
        bVal = b.breakdown.length
        break
      case 'payment':
        aVal = a.breakdown[0][key]
        bVal = b.breakdown[0][key]
        break
      case 'totalInterest':
      case 'totalPayment':
        aVal = a.breakdown[a.breakdown.length - 1][key]
        bVal = b.breakdown[b.breakdown.length - 1][key]
        break
      case 'forgiven':
        aVal = a[key] || 0
        bVal = b[key] || 0
    }

    if (!a.eligible) {
      aVal = dir === 'down' ? Number.POSITIVE_INFINITY : 0
    }

    if (!b.eligible) {
      bVal = dir === 'down' ? Number.POSITIVE_INFINITY : 0
    }

    return dir === 'down' ? aVal - bVal : bVal - aVal
  })
}

const TableHeading = props => {
  const {id, label, sort, onClick, ...rest} = props
  return (
    <th onClick={() => onClick(id)} {...rest}>
      <span>{label}</span>
      {sort.key === id ? <Caret dir={sort.dir} /> : null}
      <style jsx>{`
        span {
          cursor: pointer;
        }
      `}</style>
    </th>
  )
}

TableHeading.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  sort: PropTypes.object,
  onClick: PropTypes.func
}

const Home = () => {
  const [loan, setLoan] = useState()
  const [income, setIncome] = useState() // eslint-disable-line no-unused-vars
  const [editIncome, onToggleEditIncome] = useToggle(false)
  const [chartType, setChartType] = useState('endingBalance')
  const [selectedPayment, setSelectedPayment] = useState()
  const [sort, setSort] = useState({key: 'totalInterest', dir: 'up'})

  const onSortClick = useCallback(
    key =>
      setSort({
        key,
        dir: key === sort.key && sort.dir === 'up' ? 'down' : 'up'
      }),
    [sort]
  )

  const isUnkownLoan = loan && !LoanTypes[loan.type]

  let repayments, chartData, chartOptions
  if (loan) {
    repayments = [
      Plans.STANDARD_FIXED(loan),
      Plans.GRADUATED(loan),
      Plans.FIXED_EXTENDED(loan),
      Plans.GRADUATED_EXTENDED(loan),
      ...(income
        ? [
            Plans.INCOME_BASED_REPAY(loan, income),
            Plans.INCOME_BASED_REPAY_NEW(loan, income),
            Plans.PAY_AS_YOU_EARN(loan, income)
          ]
        : [])
    ].filter(r => r.breakdown.length)

    chartOptions = {
      legend: {display: false},
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              min: 0,
              suggestedMax: 200 // TODO(wes): Calculate this
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

    chartData = getChartData(repayments, chartType, selectedPayment)
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
            <div className="text-center mt-3 mb-4">
              <h1 className="display-4">Student Loan Calculator</h1>
              <p className="lead">
                Find the best options for repaying your student loans
              </p>
            </div>
            <div className="shadow rounded mb-4">
              <div className="px-3 pt-3 pb-1">
                <Loan onChange={setLoan} />
              </div>
              <div
                className="bg-light px-3 py-2 rounded-bottom"
                onClick={!editIncome ? onToggleEditIncome : null}>
                {editIncome ? (
                  <IncomeForm onChange={setIncome} />
                ) : (
                  <small className="text-muted">
                    <Badge variant="secondary" className="rounded-circle p-0">
                      <span className="plus">+</span>
                    </Badge>{' '}
                    Enter your income to see additional options
                  </small>
                )}
              </div>
            </div>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col key="repayments" md={income ? 10 : 8} className="repayments">
            {loan && !isUnkownLoan && (
              <>
                <Table borderless striped>
                  <thead>
                    <tr>
                      <th />
                      <th>Repayment plan</th>
                      <TableHeading
                        label="Term"
                        onClick={onSortClick}
                        id="term"
                        sort={sort}
                      />
                      <TableHeading
                        label="Per month"
                        onClick={onSortClick}
                        id="payment"
                        sort={sort}
                      />
                      <TableHeading
                        className="text-right"
                        label="Total interest"
                        onClick={onSortClick}
                        id="totalInterest"
                        sort={sort}
                      />
                      <TableHeading
                        className="text-right"
                        label="Total paid"
                        onClick={onSortClick}
                        id="totalPayment"
                        sort={sort}
                      />
                      {income ? (
                        <TableHeading
                          className="text-right"
                          label="Forgiven"
                          onClick={onSortClick}
                          id="forgiven"
                          sort={sort}
                        />
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {sortRepayments(repayments, sort).map(r => (
                      <PaymentSummary
                        {...r}
                        income={income}
                        key={r.label}
                        onMouseEnter={() => setSelectedPayment(r.label)}
                        onMouseLeave={() => setSelectedPayment()}
                      />
                    ))}
                  </tbody>
                </Table>
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
                You can retrieve your loan information from the{' '}
                <a href="https://nslds.ed.gov">
                  National Student Loan Data System
                </a>{' '}
                or by contacting your loan holder.
              </p>
            )}
          </Col>
        </Row>
      </Container>
      <style jsx>{`
        :global(.repayments) {
          transition: all 0.25s ease-out;
        }

        .bg-light.rounded-bottom {
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
