import ChartImg from '../images/chart-area.svg'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Caret from './caret'
import Chart from './payment_chart'
import Col from 'react-bootstrap/Col'
import PropTypes from 'prop-types'
import React, {useCallback, useEffect, useState} from 'react'
import Row from 'react-bootstrap/Row'
import css from 'styled-jsx/css'
import {classNames, currency, simplifyCurrency} from '../shared/helpers'

const Comparet = ({a, b, ...rest}) =>
  a != null && a !== b ? (
    <Caret
      dir={a > b ? 'up' : 'down'}
      color={a > b ? 'green' : 'red'}
      {...rest}
    />
  ) : null

Comparet.propTypes = {
  a: PropTypes.object,
  b: PropTypes.object
}

const Tile = ({
  plans,
  payment,
  versus,
  compare,
  onCompare,
  selected,
  onSelect,
  ...rest
}) => {
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

  const compareOptions = {
    payment: 'Monthly payment',
    endingBalance: 'Balance',
    totalPayment: 'Total payment',
    totalInterest: 'Total interest'
  }

  return (
    <div className={classes} {...rest}>
      <div className="card-body p-2">
        <Row>
          <Col md={6}>
            {selected ? (
              <div className="d-flex justify-content-between mb-3">
                <DropdownButton
                  onSelect={onSelect}
                  title={label}
                  variant="secondary"
                  size="sm">
                  {plans
                    .filter(p => p.eligible)
                    .map(({label: key}) => (
                      <Dropdown.Item
                        eventKey={key}
                        key={key}
                        active={key === label}>
                        {key}
                      </Dropdown.Item>
                    ))}
                </DropdownButton>
                <DropdownButton
                  onSelect={onCompare}
                  className={chartSelectClass}
                  title={
                    <>
                      <ChartImg width="16px" />
                      {compareOptions[compare]}
                    </>
                  }
                  variant="secondary"
                  size="sm">
                  {Object.entries(compareOptions).map(([key, value]) => (
                    <Dropdown.Item
                      key={key}
                      eventKey={key}
                      active={key === compare}>
                      {value}
                    </Dropdown.Item>
                  ))}
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
                  <Comparet
                    a={vsBreakdown && vsBreakdown.length}
                    b={breakdown.length}
                    className={className}
                  />
                  {Math.round(breakdown.length / 12)}
                </h5>
                <span className="small">years</span>
              </div>
              <div className="text-center border-left p-2 flex-fill">
                <h5>
                  <Comparet
                    a={vsLast && vsLast.totalPayment}
                    b={last.totalPayment}
                    className={className}
                  />
                  {simplifyCurrency(last.totalPayment)}
                </h5>
                <span className="small">total payment</span>
              </div>
            </div>
          </Col>
          <Col xs={12} md={6} className="chart mb-n2">
            <Chart
              payments={[payment, versus].filter(Boolean)}
              compare={compare}
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
  compare: PropTypes.string,
  onCompare: PropTypes.func,
  onSelect: PropTypes.func,
  payment: PropTypes.object,
  plans: PropTypes.array,
  selected: PropTypes.bool,
  versus: PropTypes.object
}

const PaymentList = ({payments}) => {
  const [selected, setSelected] = useState(payments[0])
  const onSelect = useCallback(
    label => setSelected(payments.find(r => r.label === label)),
    [payments, setSelected]
  )

  const [compare, setCompare] = useState('payment')
  const onCompare = useCallback(setCompare, [compare, setCompare])

  const eligible = payments.filter(p => p.eligible)

  // If eligible payments change, then we have to reset selected payment as
  // currently selected may become non-eligible.
  useEffect(() => {
    if (!eligible.find(p => p.label === selected.label)) {
      setSelected(eligible[0])
    }
  }, [eligible, selected, setSelected])

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
          compare={compare}
          onCompare={onCompare}
        />
        {payments.map(
          r =>
            r.label !== selected.label && (
              <Tile
                key={r.label}
                payment={r}
                versus={selected}
                plans={payments}
                compare={compare}
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
