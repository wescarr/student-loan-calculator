import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import DiscretionaryIncome from '../components/discretionary_income'
import Head from 'next/head'
import React from 'react'
import Row from 'react-bootstrap/Row'

const Discretionary = () => (
  <>
    <Head>
      <title>Discretionary Income CalculatorHome</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <DiscretionaryIncome />
        </Col>
      </Row>
    </Container>
  </>
)

export default Discretionary
