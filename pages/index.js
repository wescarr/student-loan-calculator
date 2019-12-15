import Chart from '../components/payment_chart'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Head from 'next/head'
import IncomeForm from '../components/income_form'
import Jumbotron from 'react-bootstrap/Jumbotron'
import LoanList from '../components/loan_list'
import Nav from 'react-bootstrap/Nav'
import PaymentTable from '../components/payment_table'
import React, {useCallback, useEffect, useReducer, useState} from 'react'
import Row from 'react-bootstrap/Row'
import Settings from '../components/settings'
import SettingsImg from '../images/cog.svg'
import css from 'styled-jsx/css'
import {LoanTypes, RepaymentPlans as Plans} from '../shared/loan_config'
import {consolidateLoans, States} from '../shared/calc'

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

const Home = () => {
  const [nav, setNav] = useState('loan')
  const [loans, setLoans] = useState([
    {
      id: 0,
      balance: 20000,
      rate: 0.06,
      type: 'DIRECT_SUBSIDIZED',
      plan: '',
      payments: 0,
      expanded: true
    }
  ])
  const [loan, setLoan] = useState(consolidateLoans(loans))
  useEffect(() => {
    setLoan(consolidateLoans(loans))
  }, [loans, setLoans])

  const incomeReducer = (state, data) => {
    return {...state, ...data}
  }
  const [income, setIncome] = useReducer(incomeReducer, {
    agi: 20000,
    dependents: 1,
    state: States.LOWER_48,
    filing: 'SINGLE',
    rates: {income: 0.05, inflation: 0.0236}
  })
  const onRatesChange = useCallback(rates => setIncome({rates}), [setIncome])

  const onPaymentSelect = label => {
    if (selectedPayments.includes(label) && selectedPayments.length > 1) {
      setSelectedPayments(selectedPayments.filter(l => l !== label))
    } else {
      setSelectedPayments([...selectedPayments, label])
    }
  }

  const isUnkownLoan = loan && !LoanTypes[loan.type]

  const repayments = [
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
    .map((r, i) => ({...r, color: Colors[i]}))

  const [selectedPayments, setSelectedPayments] = useState(
    repayments.slice(0, 2).map(r => r.label)
  )

  const {className, styles} = css.resolve`
    .nav-item {
      flex: none;
    }
  `

  return (
    <>
      <Head>
        <title>Student Loan Calculator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container fluid>
        <Row className="justify-content-center">
          <Col md={4}>
            <div className="text-center mt-3 mb-4">
              <h1 className="h2">Student Loan Calculator</h1>
              <p className="lead">
                Find the best options for repaying your student loans
              </p>
            </div>
            <div>
              <Nav activeKey={nav} onSelect={setNav} justify variant="pills">
                <Nav.Item>
                  <Nav.Link eventKey="loan">Loans</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="income">Income</Nav.Link>
                </Nav.Item>
                <Nav.Item className={className}>
                  <Nav.Link eventKey="settings">
                    <SettingsImg
                      width={19}
                      fill={nav === 'settings' ? '#fff' : '#aaa'}
                    />
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              <div className="pt-3 px-2">
                {nav === 'income' ? (
                  <div className="bg-light rounded px-3 pt-3 pb-1">
                    <IncomeForm income={income} onChange={setIncome} />
                  </div>
                ) : nav === 'loan' ? (
                  <LoanList loans={loans} onChange={setLoans} />
                ) : (
                  <div className="bg-light rounded px-3 pt-3 pb-1">
                    <Settings rates={income.rates} onChange={onRatesChange} />
                  </div>
                )}
              </div>
              {!nav === 'loan' && !income && (
                <div
                  className="bg-light px-3 py-2 rounded-bottom"
                  onClick={() => setNav('income')}>
                  <small className="text-muted">
                    Enter your income to see additional options
                  </small>
                </div>
              )}
            </div>
          </Col>
          <Col key="repayments" md={8} className="repayments">
            {loan && !isUnkownLoan && (
              <>
                {selectedPayments.length > 0 && (
                  <Chart
                    payments={repayments.filter(r =>
                      selectedPayments.includes(r.label)
                    )}
                  />
                )}
                <PaymentTable
                  payments={repayments}
                  selected={selectedPayments}
                  onSelect={onPaymentSelect}
                />
              </>
            )}
            {isUnkownLoan && (
              <Jumbotron className="m-5">
                <p>
                  You can retrieve your loan information from the National
                  Student Loan Data System or by contacting your loan holder.
                </p>
                <Button href="https://nslds.ed.gov">Learn more</Button>
              </Jumbotron>
            )}
          </Col>
        </Row>
      </Container>
      {styles}
      <style jsx>{`
        .bg-light.rounded-bottom {
          cursor: pointer;
        }
      `}</style>
    </>
  )
}

export default Home
