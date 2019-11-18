import PropTypes from 'prop-types'
import React from 'react'
import {classNames, currency} from '../shared/helpers'

const PaymentSummary = props => {
  const {
    color,
    label,
    eligible,
    breakdown,
    forgiven,
    income,
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
      <td>
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
          <td className="text-right">{currency(last.totalInterest)}</td>
          <td className="text-right">{currency(last.totalPayment)}</td>
          {income ? (
            <td className="text-right">{currency(forgiven || 0)}</td>
          ) : null}
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

        .payment {
          width: 175px;
          position: relative;
          padding-right: 0;
          padding-left: ${((first.payment - range.min) / range.delta) * 175}px;
        }

        .payment .gutter {
          position: absolute;
          bottom: 8px;
          height: 4px;
          left: 0;
          right: 0;
          background: #ccc;
        }

        .payment .range {
          display: block;
          margin-left: ${((first.payment - range.min) / range.delta) * 100}%;
          width: ${((last.payment - first.payment) / range.delta) * 100}%;
          min-width: 4px;
          height: 4px;
          background: red;
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
  income: PropTypes.object,
  range: PropTypes.object
}

export default PaymentSummary
