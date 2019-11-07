import PropTypes from 'prop-types'
import React from 'react'

const Select = props => {
  const {children, ...rest} = props

  return (
    <div className="form-control dropdown-toggle p-0 position-relative">
      <select {...rest} className="form-control border-0 pr-4">
        {children}
      </select>
      <style jsx>{`
        div::after {
          position: absolute;
          right: 0.75rem;
          height: 50%;
          top: 50%;
          margin-top: -0.255em;
        }

        select {
          -webkit-appearance: none;
          height: calc(1.5em + 0.75rem);
        }
      `}</style>
    </div>
  )
}

Select.propTypes = {
  children: PropTypes.any
}

export default Select
