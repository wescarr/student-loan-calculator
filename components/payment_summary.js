import PropTypes from 'prop-types'
import React from 'react'
import {classNames, currency, simplifyCurrency} from '../shared/helpers'

const PaymentSummary = props => {
  const {
    color,
    label,
    eligible,
    breakdown,
    forgiven = 0,
    compare,
    compareRange,
    selected,
    range,
    ...rest
  } = props
  const [first] = breakdown
  const last = breakdown[breakdown.length - 1]

  return (
    <tr
      className={classNames({'text-muted': !eligible, selected, eligible})}
      {...rest}>
      <td className="icon text-center">
        {eligible && (
          <div className="border border-white rounded-circle d-inline-block" />
        )}
      </td>
      <td>{label}</td>
      {eligible ? (
        <>
          <td>{Math.round(breakdown.length / 12)} years</td>
          <td className="text-right">
            {first.payment === last.payment
              ? currency(first.payment)
              : `${currency(first.payment)} - ${currency(last.payment)}`}
          </td>
          <td className="payment px-0">
            <span className="gutter rounded">
              <span className="range rounded bg-info" />
            </span>
          </td>
          <td className="text-right pl-3">
            {compare === 'forgiven'
              ? simplifyCurrency(forgiven || 0)
              : simplifyCurrency(last[compare])}
          </td>
          <td className="compare pl-0">
            <span className="gutter rounded">
              <span className="range rounded bg-info" />
            </span>
          </td>
        </>
      ) : (
        <td colSpan="5">Your loan is not elgible for this repayment plan</td>
      )}
      <style jsx>{`
        div.rounded-circle {
          background-color: ${selected ? color : '#d6d8db'};
          width: 15px;
          height: 15px;
        }

        td {
          vertical-align: middle;
        }

        tr.eligible td:nth-child(1),
        tr.eligible td:nth-child(2) {
          cursor: pointer;
        }

        .icon {
          width: 25px;
        }

        .gutter {
          position: relative;
          display: block;
          width: 100px;
          height: 8px;
          background: #ccc;
        }

        .range {
          display: block;
          position: absolute;
          min-width: 8px;
          height: 8px;
          transition: all 0.5s ease-out;
        }

        .payment .range {
          left: ${(first.payment / range.max) * 100}%;
          width: ${((last.payment - first.payment) / range.max) * 100}%;
        }

        .compare .range {
          width: ${((compare === 'forgiven' ? forgiven : last[compare]) /
            compareRange.max) *
            100}%;
        }
      `}</style>
    </tr>
  )
}

PaymentSummary.propTypes = {
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  breakdown: PropTypes.array.isRequired,
  eligible: PropTypes.bool.isRequired,
  forgiven: PropTypes.number,
  selected: PropTypes.bool,
  compare: PropTypes.string,
  range: PropTypes.object,
  compareRange: PropTypes.object
}

export default PaymentSummary
