import AlignImg from '../images/align-left.svg'
import BadgeImg from '../images/badge-percent.svg'
import BandaidImg from '../images/band-aid.svg'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import Caret from './caret'
import Chart from './payment_chart'
import ChartImg from '../images/chart-area.svg'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import GripImg from '../images/grip-lines.svg'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import PropTypes from 'prop-types'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import Row from 'react-bootstrap/Row'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import Tooltip from 'react-bootstrap/Tooltip'
import css from 'styled-jsx/css'
import {currency, simplifyCurrency} from '../shared/helpers'

const Comparet = ({a, b, ...rest}) =>
  a != null && a !== b ? (
    <Caret
      dir={a > b ? 'up' : 'down'}
      color={a > b ? 'green' : 'red'}
      {...rest}
    />
  ) : null

Comparet.propTypes = {
  a: PropTypes.number,
  b: PropTypes.number
}

const Badge = ({type}) => {
  switch (type) {
    case 'IDR':
      return (
        <OverlayTrigger
          overlay={
            <Tooltip>
              <small>Payments are based on your discretionary income</small>
            </Tooltip>
          }>
          <BadgeImg height="22px" fill="#999" />
        </OverlayTrigger>
      )
    case 'PFH':
      return (
        <OverlayTrigger
          overlay={
            <Tooltip>
              <small>Requires partial financial hardship</small>
            </Tooltip>
          }>
          <BandaidImg height="22px" fill="#999" />
        </OverlayTrigger>
      )
  }

  return null
}

Badge.propTypes = {
  type: PropTypes.string
}

const Tile = ({payment, versus, compare, expanded, ...rest}) => {
  const {label, eligible, breakdown, description, requirements = []} = payment

  const [first] = breakdown
  const last = breakdown[breakdown.length - 1]

  let vsFirst, vsLast, vsBreakdown
  if (versus) {
    vsBreakdown = versus.breakdown
    vsFirst = vsBreakdown[0]
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

  // Determines if description is longer than 2 lines
  const textRef = useRef(null)
  const [moreText, setMoreText] = useState(false)
  const checkMoreText = useCallback(() => {
    const {scrollHeight, offsetHeight} = textRef.current || {}
    setMoreText(scrollHeight > offsetHeight)
  }, [setMoreText])

  // Toggle state for expanding/collapsing description
  const [textExpanded, setTextExpanded] = useState(false)
  const transition = useRef(false)
  const onTextClick = useCallback(() => {
    transition.current = true
    setTextExpanded(!textExpanded)
  }, [textExpanded, setTextExpanded])

  // When the description changes, collapse it and recalc if it overflows once
  // the transition finishes
  useEffect(() => setTextExpanded(false), [description])
  const onTransitionEnd = useCallback(() => {
    if (!textExpanded) {
      checkMoreText()
    }
    transition.current = false
  }, [textExpanded, checkMoreText])

  // Check for text overflow when description changes in collapsed state
  useEffect(() => {
    if (!(textExpanded || transition.current)) {
      checkMoreText()
    }
  }, [description, checkMoreText, textExpanded])

  if (!eligible) {
    return (
      <div className="bg-light p-1">
        <div className="card-body p-2">
          <h6 className="card-title mt-2 font-weight-bold">{label}</h6>
          <div className="card-text">
            Your loan is not elgible for this repayment plan
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-1" {...rest}>
      <div className="card-body p-2">
        <Row>
          <Col md={6}>
            <h6 className="card-title d-flex mt-2 font-weight-bold">
              <span className="flex-grow-1">{label}</span>
              {requirements.map(r => (
                <Badge key={r} type={r} />
              ))}
            </h6>
            <div className="card-text d-flex flex-row mt-2">
              <div className="text-center border-right py-2">
                <h5>
                  <Comparet
                    a={versus && vsFirst.payment}
                    b={first.payment}
                    className={className}
                  />
                  {first.payment === last.payment
                    ? currency(first.payment)
                    : `${currency(first.payment)} - ${currency(last.payment)}`}
                </h5>
                <span className="small">per month</span>
              </div>
              <div className="text-center py-2">
                <h5>
                  <Comparet
                    a={versus && vsBreakdown.length}
                    b={breakdown.length}
                    className={className}
                  />
                  {Math.round(breakdown.length / 12)}
                </h5>
                <span className="small">years</span>
              </div>
              <div className="text-center border-left py-2">
                <h5>
                  <Comparet
                    a={versus && vsLast.totalPayment}
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
        {expanded && (
          <Row>
            <Col>
              <div className="small mt-2 bg-light p-2 rounded">
                <p
                  ref={textRef}
                  className="description m-0 position-relative"
                  onTransitionEnd={onTransitionEnd}
                  onClick={onTextClick}>
                  {description}{' '}
                  {!textExpanded && moreText && (
                    <span className="d-inline-block bg-light text-muted position-absolute">
                      ...read more
                    </span>
                  )}
                </p>
              </div>
            </Col>
          </Row>
        )}
      </div>
      {styles}
      <style jsx>{`
        .card-title > :global(svg) {
          margin-left: 10px;
        }

        .card-text > div:first-child {
          width: 40%;
        }

        .card-text > div:nth-child(2) {
          width: 25%;
        }

        .card-text > div:last-child {
          width: 35%;
        }

        h5 {
          margin: 0;
        }

        .description {
          overflow: hidden;
          max-height: ${textExpanded ? '10rem' : '3em'};
          cursor: ${moreText ? 'pointer' : 'auto'};
          transition: max-height 0.25s ease-out;
        }

        .description > span {
          bottom: 0;
          right: 0;
          box-shadow: 0 4px 8px 4px #f8f9fa;
        }

        @media (prefers-color-scheme: dark) {
          .description > span {
            box-shadow: 0 4px 8px 4px #343a40;
          }
        }
      `}</style>
    </div>
  )
}

Tile.propTypes = {
  compare: PropTypes.string,
  payment: PropTypes.object,
  versus: PropTypes.object,
  expanded: PropTypes.bool
}

const PaymentList = ({payments}) => {
  const eligible = payments.filter(p => p.eligible)
  const [selected, setSelected] = useState(eligible[0])
  const onSelect = useCallback(
    label => setSelected(payments.find(r => r.label === label)),
    [payments, setSelected]
  )

  const [compare, setCompare] = useState('payment')
  const onCompare = useCallback(setCompare, [compare, setCompare])

  useEffect(
    () =>
      setSelected(
        eligible.find(p => p.label === selected.label) || eligible[0]
      ),
    [eligible, selected, setSelected]
  )

  const [detail, setDetail] = useState(true)
  const onDetailChange = useCallback(value => setDetail(value), [setDetail])

  const {className: dropdownClass, styles: dropdownStyle} = css.resolve`
    .dropdown :global(svg) {
      fill: #fff;
      margin-right: 5px;
    }

    .dropdown :global(.btn) {
      display: block;
      width: 100%;
    }
  `

  const compareOptions = {
    payment: 'Monthly payment',
    endingBalance: 'Balance',
    totalPayment: 'Total payment',
    totalInterest: 'Total interest'
  }

  return (
    <>
      <p className="lead mt-2 text-center">
        Based on your loans and income, you qualify for {eligible.length}{' '}
        repayment plans.
        <br />
        Choose a plan below to see how it compares to all the others.
      </p>
      <div className="mb-3">
        <ButtonToolbar className="justify-content-center d-block d-sm-flex">
          <DropdownButton
            onSelect={onSelect}
            title={selected.label}
            variant="secondary"
            className={`d-block d-sm-inline-block mx-0 mb-2 mr-sm-2 ${dropdownClass}`}>
            {eligible.map(({label: key}) => (
              <Dropdown.Item
                eventKey={key}
                key={key}
                active={key === selected.label}>
                {key}
              </Dropdown.Item>
            ))}
          </DropdownButton>
          <DropdownButton
            onSelect={onCompare}
            className={`mx-0 mb-2 mr-sm-2 ${dropdownClass}`}
            title={
              <>
                <ChartImg width="16px" />
                {compareOptions[compare]}
              </>
            }
            variant="secondary">
            {Object.entries(compareOptions).map(([key, value]) => (
              <Dropdown.Item key={key} eventKey={key} active={key === compare}>
                {value}
              </Dropdown.Item>
            ))}
          </DropdownButton>
          <ToggleButtonGroup
            value={detail}
            onChange={onDetailChange}
            type="radio"
            name="detail"
            className="d-block text-center">
            <ToggleButton value={false} variant="secondary">
              <GripImg width="16px" fill="#fff" />
            </ToggleButton>
            <ToggleButton value={true} variant="secondary">
              <AlignImg width="16px" fill="#fff" />
            </ToggleButton>
          </ToggleButtonGroup>
        </ButtonToolbar>
        {dropdownStyle}
        <style jsx>
          {`
            div {
              position: relative;
              z-index: 1021; // One higher than sticky index
            }
          `}
        </style>
      </div>
      <div className="mx-n3 mx-sm-auto">
        <div className="card shadow position-sticky sticky-top">
          <Tile payment={selected} compare={compare} expanded={detail} />
        </div>
        {payments.map(
          r =>
            r.label !== selected.label && (
              <div key={r.label} className="border-bottom">
                <Tile
                  payment={r}
                  versus={selected}
                  compare={compare}
                  expanded={detail}
                />
              </div>
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
