import PropTypes from 'prop-types'
import React from 'react'

const borders = {
  up: ['top', 'right', 'bottom', 'left'],
  down: ['bottom', 'right', 'top', 'left'],
  right: ['left', 'top', 'right', 'bottom'],
  left: ['right', 'top', 'left', 'bottom']
}

const Caret = props => {
  const {dir, color, ...rest} = props
  const seq = borders[dir]

  return (
    <span {...rest}>
      <style jsx>{`
        span {
          display: inline-block;
          vertical-align: 0.255em;
          content: '';
          border-${seq[0]}: ${color} 0.3em solid;
          border-${seq[1]}: 0.3em solid transparent;
          border-${seq[2]}: 0;
          border-${seq[3]}: 0.3em solid transparent;
        }
      `}</style>
    </span>
  )
}

Caret.propTypes = {
  dir: PropTypes.string,
  color: PropTypes.string
}

Caret.defaultProps = {
  color: '#333'
}

export default Caret
