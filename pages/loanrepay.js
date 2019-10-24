import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Head from 'next/head'
import LoanRepayment from '../components/loan_repayment'
import React from 'react'
import Row from 'react-bootstrap/Row'

const LoanRepay = () => (
  <>
    <Head>
      <title>Loan Repayment Calculator</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <LoanRepayment />
        </Col>
      </Row>
    </Container>
  </>
)

export default LoanRepay
