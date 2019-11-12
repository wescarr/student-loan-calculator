import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  &::after {
    height: 50%;
    margin-top: -0.255em;
    position: absolute;
    right: 0.75rem;
    top: 50%;
  }
`

const Inner = styled.select`
  -webkit-appearance: none;
  height: calc(1.5em + 0.75rem);
`

const Select = ({children, ...props}) => (
  <Container className="form-control dropdown-toggle p-0 position-relative">
    <Inner {...props} className="form-control border-0 pr-4">
      {children}
    </Inner>
  </Container>
)

Select.propTypes = {
  children: PropTypes.any
}

export default Select
