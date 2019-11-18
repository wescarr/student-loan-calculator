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
      <td className="icon">
        {eligible && (
          <div className="border border-white rounded-circle d-inline-block" />
        )}
      </td>
      <td>{label}</td>
      {eligible ? (
        <>
          <td>{Math.round(breakdown.length / 12)} years</td>
          <td className="payment">
            {first.payment === last.payment ? (
              <span>{currency(first.payment)}</span>
            ) : (
              <>
                <span>{currency(first.payment)}</span> -{' '}
                <span>{currency(last.payment)}</span>
              </>
            )}
            <span className="gutter rounded">
              <span className="range rounded bg-info" />
            </span>
          </td>
          <td className="compare text-right">
            <span className="label">
              {compare === 'forgiven'
                ? simplifyCurrency(forgiven || 0)
                : simplifyCurrency(last[compare])}
            </span>
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
          position: absolute;
          bottom: 8px;
          height: 5px;
          left: 0;
          right: 0;
          background: #ccc;
        }

        .range {
          display: block;
          min-width: 5px;
          height: 5px;
          background: red;
          transition: all 0.5s ease-out;
        }

        .payment {
          width: 175px;
          position: relative;
          padding-left: ${((first.payment - range.min) / range.delta) * 175}px;
        }

        .payment .range {
          margin-left: ${((first.payment - range.min) / range.delta) * 100}%;
          width: ${((last.payment - first.payment) / range.delta) * 100}%;
        }

        .compare {
          width: 175px;
          position: relative;
        }

        .compare .label {
          position: relative;
          right: ${Math.min(
            ((compareRange.max -
              (compare === 'forgiven' ? forgiven : last[compare])) /
              compareRange.delta) *
              175,
            100
          )}px;
          transition: all 0.5s ease-out;
        }

        .compare .gutter {
          left: 12px;
          right: 12px;
        }

        .compare .range {
          width: ${(((compare === 'forgiven' ? forgiven : last[compare]) -
            compareRange.min) /
            compareRange.delta) *
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
