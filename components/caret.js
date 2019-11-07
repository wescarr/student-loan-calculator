import PropTypes from 'prop-types'
import React from 'react'

const Caret = props => (
  <div>
    <style jsx>{`
        div {
          display: inline-block;
          margin-left: 0.255em;
          vertical-align: 0.255em;
          content: '';
          border-${props.dir === 'down' ? 'bottom' : 'top'}: 0.3em solid;
          border-right: 0.3em solid transparent;
          border-${props.dir === 'down' ? 'top' : 'bottom'}: 0;
          border-left: 0.3em solid transparent;
        }
      `}</style>
  </div>
)

Caret.propTypes = {
  dir: PropTypes.string
}

export default Caret
