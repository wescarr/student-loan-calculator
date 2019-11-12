import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  background-color: ${props => (props.selected ? props.color : '#d6d8db')};
  width: 15px;
  height: 15px;
`

const RoundedCircle = props => (
  <Container
    className="border border-white rounded-circle d-inline-block"
    {...props}
  />
)

RoundedCircle.propTypes = {
  color: PropTypes.string,
  selected: PropTypes.bool
}

export default RoundedCircle
