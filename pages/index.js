import Caret from '../components/caret'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Head from 'next/head'
import IncomeForm from '../components/income_form'
import Loan from '../components/loan'
import Nav from 'react-bootstrap/Nav'
import PropTypes from 'prop-types'
import React, {useCallback, useEffect, useState} from 'react'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import chartImg from '../images/chart-area.svg'
import dynamic from 'next/dynamic'
import {LoanTypes, RepaymentPlans as Plans} from '../shared/loan_config'

import {
  classNames,
  currency,
  hexToRgbA,
  simplifyCurrency
} from '../shared/helpers'

const Chart = dynamic(import('react-chartjs-2').then(mod => mod.Bar))

// Colors: https://blog.graphiq.com/finding-the-right-color-palettes-for-data-visualizations-fcd4e707a283
const Colors = [
  '#86cacf',
  '#3883b6',
  '#1c2d80',
  '#f8cd60',
  '#e87e3a',
  '#a34428',
  '#f19a9b',
  '#7b2995',
  '#461664'
]

const getYearBreakdown = (breakdown, attr) => {
  const years = []
  for (let i = 12; i <= breakdown.length; i += 12) {
    years.push(breakdown[i - 1][attr])
  }

  return years
}

const getPaymentsRange = repayments => {
  const first = repayments.map(r => r.breakdown[0].payment)
  const last = repayments.map(r => r.breakdown[r.breakdown.length - 1].payment)

  const range = {
    min: Math.min(...first),
    max: Math.max(...last)
  }

  range.delta = range.max - range.min

  return range
}

const dataset = (label, data, bgColor) => ({
  label,
  data,
  fill: 'origin',
  lineTension: 0.1,
  borderColor: bgColor,
  backgroundColor: hexToRgbA(bgColor, 0.8),
  hoverBackgroundColor: hexToRgbA(bgColor, 1),
  borderWidth: 0,
  pointRadius: 0,
  pointHitRadius: 5,
  pointBackgroundColor: bgColor
})

const getChartData = (repayments, attr) => {
  const datasets = repayments
    .filter(r => r.eligible)
    .map(r => dataset(r.label, getYearBreakdown(r.breakdown, attr), r.color))

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
  const {
    color,
    label,
    eligible,
    breakdown,
    forgiven,
    income,
    selected,
    range,
    ...rest
  } = props
  const [first] = breakdown
  const last = breakdown[breakdown.length - 1]

  return (
    <tr
      className={classNames({'text-muted': !eligible, selected, eligible})}
      {...rest}>
      <td>
        {eligible && (
          <div className="border border-white rounded-circle d-inline-block" />
        )}
      </td>
      <td>{label}</td>
      {eligible ? (
        <>
          <td>{Math.round(breakdown.length / 12)} years</td>
          <td className="payment">
            {first.payment === last.payment ? (
              <span>{currency(first.payment)}</span>
            ) : (
              <>
                <span>{currency(first.payment)}</span> -{' '}
                <span>{currency(last.payment)}</span>
              </>
            )}
            <span className="gutter rounded">
              <span className="range rounded bg-info" />
            </span>
          </td>
          <td className="text-right">{currency(last.totalInterest)}</td>
          <td className="text-right">{currency(last.totalPayment)}</td>
          {income ? (
            <td className="text-right">{currency(forgiven || 0)}</td>
          ) : null}
        </>
      ) : (
        <td colSpan="5">Your loan is not elgible for this repayment plan</td>
      )}
      <style jsx>{`
        div.rounded-circle {
          background-color: ${selected ? color : '#d6d8db'};
          width: 15px;
          height: 15px;
        }

        td {
          vertical-align: middle;
        }

        tr.eligible td:nth-child(1),
        tr.eligible td:nth-child(2) {
          cursor: pointer;
        }

        .payment {
          width: 150px;
          position: relative;
        }

        .payment {
          padding-left: ${((first.payment - range.min) / range.delta) * 150}px;
        }

        .payment .gutter {
          position: absolute;
          bottom: 8px;
          height: 4px;
          left: 0;
          right: 0;
          background: #ccc;
        }

        .payment .range {
          display: block;
          margin-left: ${((first.payment - range.min) / range.delta) * 100}%;
          width: ${((last.payment - first.payment) / range.delta) * 100}%;
          min-width: 4px;
          height: 4px;
          background: red;
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
  selected: PropTypes.bool,
  income: PropTypes.object,
  range: PropTypes.object
}

const sortRepayments = (list, sort = {}) => {
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
      {sort && sort.key === id ? <Caret dir={sort.dir} /> : null}
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
  const [editIncome, setEditIncome] = useState(false)
  const [chartType, setChartType] = useState('endingBalance')
  const [selectedPayments, setSelectedPayment] = useState([])
  const [sort, setSort] = useState()

  const onSortClick = useCallback(
    key =>
      setSort({
        key,
        dir: sort && key === sort.key && sort.dir === 'down' ? 'up' : 'down'
      }),
    [sort]
  )

  const onPaymentSummaryClick = label => {
    if (selectedPayments.includes(label) && selectedPayments.length > 1) {
      setSelectedPayment(selectedPayments.filter(l => l !== label))
    } else {
      setSelectedPayment([...selectedPayments, label])
    }
  }

  // We intentially only rely on `loan` as a dependency to set the default
  // selected payments when the loan value initially changes.
  useEffect(() => {
    if (loan && selectedPayments.length === 0) {
      setSelectedPayment(repayments.slice(0, 2).map(r => r.label))
    }
  }, [loan]) // eslint-disable-line react-hooks/exhaustive-deps

  const isUnkownLoan = loan && !LoanTypes[loan.type]

  let repayments, range, chartData, chartOptions
  if (loan) {
    repayments = sortRepayments(
      [
        Plans.STANDARD_FIXED(loan),
        Plans.GRADUATED(loan),
        Plans.FIXED_EXTENDED(loan),
        Plans.GRADUATED_EXTENDED(loan),
        ...(income
          ? [
              Plans.INCOME_BASED_REPAY(loan, income),
              Plans.INCOME_BASED_REPAY_NEW(loan, income),
              Plans.PAY_AS_YOU_EARN(loan, income),
              Plans.REVISED_PAY_AS_YOU_EARN(loan, income),
              Plans.INCOME_CONTINGENT_REPAY(loan, income)
            ]
          : [])
      ]
        .filter(r => r.breakdown.length)
        .map((r, i) => ({...r, color: Colors[i]})),
      sort
    )

    range = getPaymentsRange(repayments)

    chartOptions = {
      legend: {display: false},
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: simplifyCurrency,
              min: 0
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

    chartData =
      !!selectedPayments.length &&
      getChartData(
        repayments.filter(r => selectedPayments.includes(r.label)),
        chartType
      )
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
              <Nav
                activeKey={editIncome ? 'income' : 'loan'}
                onSelect={key => setEditIncome(key === 'income')}
                justify
                variant="pills"
                className="px-3 pt-3">
                <Nav.Item>
                  <Nav.Link eventKey="loan">Loan</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="income">Income</Nav.Link>
                </Nav.Item>
              </Nav>
              <div className="px-3 pt-3 pb-1">
                {editIncome ? (
                  <IncomeForm onChange={setIncome} />
                ) : (
                  <Loan onChange={setLoan} />
                )}
              </div>
              {!editIncome && !income && (
                <div
                  className="bg-light px-3 py-2 rounded-bottom"
                  onClick={() => setEditIncome(true)}>
                  <small className="text-muted">
                    Enter your income to see additional options
                  </small>
                </div>
              )}
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
                      <th>
                        <img src={chartImg} />
                      </th>
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
                    {repayments.map(r => (
                      <PaymentSummary
                        {...r}
                        income={income}
                        range={range}
                        key={r.label}
                        selected={selectedPayments.includes(r.label)}
                        onClick={() => onPaymentSummaryClick(r.label)}
                      />
                    ))}
                  </tbody>
                </Table>
                {chartData && (
                  <>
                    <div className="mt-4 mb-2 text-center">
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
      `}</style>
    </>
  )
}

export default Home
