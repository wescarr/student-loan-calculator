import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Head from 'next/head'
import IncomeForm from '../components/income_form'
import LoanList from '../components/loan_list'
import Nav from 'react-bootstrap/Nav'
import PaymentList from '../components/payment_list'
import React, {useCallback, useEffect, useReducer, useState} from 'react'
import Row from 'react-bootstrap/Row'
import Settings from '../components/settings'
import SettingsImg from '../images/cog.svg'
import WrenchImg from '../images/wrench.svg'
import css from 'styled-jsx/css'
import {
  consolidateLoans,
  getRepaymentOpions,
  LoanTypes
} from '../shared/loan_config'
import {States} from '../shared/calc'

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

  const incomeReducer = (state, data) => {
    return {...state, ...data}
  }
  const [income, setIncome] = useReducer(incomeReducer, {
    agi: 30000,
    dependents: 1,
    state: States.LOWER_48,
    filing: 'SINGLE',
    rates: {income: 0.05, inflation: 0.0236}
  })
  const onRatesChange = useCallback(rates => setIncome({rates}), [setIncome])

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
  const [loan, setLoan] = useState(consolidateLoans(loans, income))
  useEffect(() => {
    setLoan(consolidateLoans(loans, income))
  }, [income, loans, setLoans])

  const onPaymentSelect = label => {
    if (selectedPayments.includes(label) && selectedPayments.length > 1) {
      setSelectedPayments(selectedPayments.filter(l => l !== label))
    } else {
      setSelectedPayments([...selectedPayments, label])
    }
  }

  const isUnkownLoan = !LoanTypes[loan.type]
  const isPrivateLoan = loan.type === 'PRIVATE'
  const isEligble = !(isUnkownLoan || isPrivateLoan)

  const repayments = getRepaymentOpions(loan, income).map((r, i) => ({
    ...r,
    color: Colors[i]
  }))

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
        <link
          href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Container fluid>
        <Row className="justify-content-center">
          <Col sm={8} md={8} lg={6} xl={5}>
            <div className="text-center mt-3 mb-4">
              <h1 className="mt-5 mb-0">Student Loan Calculator</h1>
              <p className="font-italic">
                Find the best options for repaying{' '}
                <span className="text-nowrap">your student loans</span>
              </p>
              Developed in partnership with{' '}
              <p className="mb-5">
                <a
                  href="http://freestudentloanadvice.org/"
                  className="text-nowrap">
                  The Institute of Student Loan Advisors
                </a>
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
                  <div className="shadow border rounded px-3 pt-3 pb-1 mb-4">
                    <IncomeForm income={income} onChange={setIncome} />
                  </div>
                ) : nav === 'loan' ? (
                  <LoanList loans={loans} income={income} onChange={setLoans} />
                ) : (
                  <div className="shadow border rounded px-3 pt-3 pb-1 mb-4">
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
            {!isEligble && (
              <div className="my-5 pt-4 text-center border-top lead">
                {isUnkownLoan && (
                  <>
                    <p>
                      You can retrieve your loan information from the{' '}
                      <strong>National Student Loan Data System</strong> or by
                      contacting your loan holder.
                    </p>
                    <Button href="https://nslds.ed.gov">Learn more</Button>
                  </>
                )}
                {isPrivateLoan &&
                  `
                    You will need to contact your loan holder for the specific
                    terms of your repayment plan.
                `}
              </div>
            )}
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col sm={8} md={8} lg={6}>
            <div className="repayments">
              {isEligble && (
                <PaymentList
                  payments={repayments}
                  selected={selectedPayments}
                  onSelect={onPaymentSelect}
                />
              )}
            </div>
            <div className="mt-4 small">
              <p>
                <strong>Discretionary Income:</strong> Your discrectionary
                income is your adjsuted gross income (typically what you declare
                in your income tax returns) minus 150% of the{' '}
                <a
                  href="https://aspe.hhs.gov/poverty-guidelines"
                  rel="noopener noreferrer"
                  target="_blank">
                  Fedral Poverty Guideline
                </a>{' '}
                for your family size.
              </p>
              <p>
                <strong>Partial Financial Hardship:</strong> If your annual
                payment under the Standard Fixed 10 year plan is greater than a
                percentage of your discrectionary income, you qualify as having
                a partial financial hardship. The percentage is 15% for IBR
                plans, and 10% for PAYE plans.
              </p>
            </div>
            <div className="mt-5 mb-5 text-center">
              <span className="small d-inline-block p-2 bg-light rounded-pill">
                <WrenchImg width="16" title="Created" /> by{' '}
                <a href="https://www.linkedin.com/in/wescarr">Wes Carr</a>
              </span>
            </div>
          </Col>
        </Row>
      </Container>
      {styles}
      <style jsx>{`
        .bg-light.rounded-bottom {
          cursor: pointer;
        }
      `}</style>
      <style jsx global>{`
        body {
          font-family: 'Roboto', sans-serif;
        }
      `}</style>
    </>
  )
}

export default Home
