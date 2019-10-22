import React from 'react'
import DiscretionaryIncome from '../components/discretionary_income'
import Head from 'next/head'

const Home = () => (
  <div className="container">
    <Head>
      <title>Home</title>
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="stylesheet"
        href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
      />
    </Head>

    <div className="row justify-content-center">
      <div className="col-md-6">
        <DiscretionaryIncome />
      </div>
    </div>
  </div>
)

export default Home
