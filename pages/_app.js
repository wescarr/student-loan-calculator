import NextApp from 'next/app'
import React from 'react'

import 'bootstrap/scss/bootstrap.scss'
import '../scss/darkmode.scss'

class App extends NextApp {
  render() {
    const {Component, pageProps} = this.props
    return <Component {...pageProps} />
  }
}

export default App
