import NextApp from 'next/app'
import React from 'react'
import {ThemeProvider, createGlobalStyle} from 'styled-components'

import 'bootstrap/scss/bootstrap.scss'

const theme = {
  colors: {}
}

const GlobalStyles = createGlobalStyle`
  .cursor-pointer {
    cursor: pointer;
  }
`

class App extends NextApp {
  render() {
    const {Component, pageProps} = this.props
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Component {...pageProps} />
      </ThemeProvider>
    )
  }
}

export default App
