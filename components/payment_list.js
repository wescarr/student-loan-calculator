import ChartImg from '../images/chart-area.svg'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Caret from './caret'
import Chart from './payment_chart'
import Col from 'react-bootstrap/Col'
import PropTypes from 'prop-types'
import React, {useCallback, useState} from 'react'
import Row from 'react-bootstrap/Row'
import css from 'styled-jsx/css'
import {classNames, currency, simplifyCurrency} from '../shared/helpers'

const Tile = ({plans, payment, versus, selected, onSelect, ...rest}) => {
  const {label, eligible, breakdown} = payment

  const [first] = breakdown
  const last = breakdown[breakdown.length - 1]

  let vsLast, vsBreakdown
  if (versus) {
    vsBreakdown = versus.breakdown
    vsLast = vsBreakdown[vsBreakdown.length - 1]
    payment.color = '#7b2995'
    versus.color = '#f19a9b'
  } else {
    payment.color = '#f19a9b'
  }

  const {className, styles} = css.resolve`
    span {
      margin-left: -15px;
      margin-right: 5px;
    }
  `

  const {className: chartSelectClass, styles: selectStyles} = css.resolve`
    .dropdown :global(.dropdown-toggle::after) {
      display: none;
    }

    .dropdown :global(svg) {
      fill: #fff;
      margin-right: 5px;
    }
  `

  const classes = classNames({
    card: selected,
    'p-1': 1,
    shadow: selected,
    'border-bottom': !selected,
    'position-sticky': selected,
    'sticky-top': selected,
    'bg-light': !eligible
  })

  if (!eligible) {
    return (
      <div className={classes}>
        <div className="card-body p-2">
          <h6 className="card-title font-weight-bold">{label}</h6>
          <div className="card-text">
            Your loan is not elgible for this repayment plan
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={classes} {...rest}>
      <div className="card-body p-2">
        <Row>
          <Col md={6}>
            {selected ? (
              <div className="d-flex justify-content-between mb-3">
                <DropdownButton
                  title={label}
                  variant="secondary"
                  size="sm"
                  onSelect={onSelect}>
                  {plans
                    .filter(p => p.eligible)
                    .map(({label}) => (
                      <Dropdown.Item eventKey={label} key={label}>
                        {label}
                      </Dropdown.Item>
                    ))}
                </DropdownButton>
                <DropdownButton
                  className={chartSelectClass}
                  title={
                    <>
                      <ChartImg width="16px" />
                      Monthly payment
                    </>
                  }
                  variant="secondary"
                  size="sm">
                  <Dropdown.Item>Monthly payment</Dropdown.Item>
                </DropdownButton>
                {selectStyles}
              </div>
            ) : (
              <h6 className="card-title font-weight-bold">{label}</h6>
            )}
            <div className="card-text d-flex flex-row mt-2">
              <div className="text-center border-right p-2 flex-fill">
                <h5>
                  {first.payment === last.payment
                    ? currency(first.payment)
                    : `${currency(first.payment)} - ${currency(last.payment)}`}
                </h5>
                <span className="small">per month</span>
              </div>
              <div className="text-center p-2 flex-fill">
                <h5>
                  {vsBreakdown && vsBreakdown.length !== breakdown.length ? (
                    <Caret
                      className={className}
                      dir={
                        vsBreakdown.length > breakdown.length ? 'up' : 'down'
                      }
                      color={
                        vsBreakdown.length > breakdown.length ? 'green' : 'red'
                      }
                    />
                  ) : null}
                  {Math.round(breakdown.length / 12)}
                </h5>
                <span className="small">years</span>
              </div>
              <div className="text-center border-left p-2 flex-fill">
                <h5>
                  {vsLast && vsLast.totalPayment !== last.totalPayment ? (
                    <Caret
                      className={className}
                      dir={
                        vsLast.totalPayment > last.totalPayment ? 'up' : 'down'
                      }
                      color={
                        vsLast.totalPayment > last.totalPayment
                          ? 'green'
                          : 'red'
                      }
                    />
                  ) : null}
                  {simplifyCurrency(last.totalPayment)}
                </h5>
                <span className="small">total payment</span>
              </div>
            </div>
          </Col>
          <Col xs={12} md={6} className="chart mb-n2">
            <Chart
              payments={[payment, versus].filter(Boolean)}
              showToggle={false}
              options={{height: 100}}
            />
          </Col>
        </Row>
      </div>
      {styles}
      <style jsx>{`
        .card-text > div {
          width: calc(1 / 3 * 100%);
        }

        h5 {
          margin: 0;
        }
      `}</style>
    </div>
  )
}

Tile.propTypes = {
  plans: PropTypes.array,
  selected: PropTypes.bool,
  versus: PropTypes.object,
  payment: PropTypes.object,
  onSelect: PropTypes.func
}

const PaymentList = ({payments}) => {
  const [selected, setSelected] = useState(payments[0])
  const onSelect = useCallback(
    label => setSelected(payments.find(r => r.label === label)),
    [payments, setSelected]
  )

  const eligible = payments.filter(p => p.eligible)

  return (
    <>
      <p className="lead mt-2 text-center">
        Based on your loans and income, you qualify for {eligible.length}{' '}
        repayment plans.
        <br />
        Choose a plan below to see how it compares to all the others.
      </p>
      <div className="mx-n3 mx-sm-auto">
        <Tile
          payment={selected}
          selected={true}
          plans={payments}
          onSelect={onSelect}
        />
        {payments.map(
          r =>
            r.label !== selected.label && (
              <Tile
                key={r.label}
                payment={r}
                versus={selected}
                plans={payments}
              />
            )
        )}
      </div>
    </>
  )
}

PaymentList.propTypes = {
  payments: PropTypes.array
}

export default PaymentList
