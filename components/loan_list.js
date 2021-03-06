import Button from 'react-bootstrap/Button'
import Loan from './loan'
import PropTypes from 'prop-types'
import React, {useCallback, useEffect, useMemo, useReducer} from 'react'
import {CSSTransitionGroup} from 'react-transition-group'
import {consolidateLoans} from '../shared/loan_config.js'
import {currency, formatFloat, plural} from '../shared/helpers'
import {listReducer, useRouteConfig} from '../shared/hooks'

let LOAN_ID = 1

const LoanList = ({loans, income, onChange}) => {
  const [list, updateList] = useReducer(listReducer, loans)
  const onLoanChange = useCallback(
    (id, data) => updateList({type: 'update', id, data}),
    [updateList]
  )
  const onLoanAdd = useCallback(() => {
    // Collapse any expanded loans
    list
      .filter(i => i.expanded)
      .forEach(({id}) =>
        updateList({type: 'update', id, data: {expanded: false}})
      )
    // Add new loan
    updateList({
      type: 'add',
      data: {
        id: LOAN_ID++,
        balance: 10000,
        rate: 0.05,
        type: 'DIRECT_SUBSIDIZED',
        plan: '',
        payments: 0,
        expanded: true
      }
    })
  }, [list, updateList])

  const onLoanRemove = useCallback(id => updateList({type: 'remove', id}), [
    updateList
  ])

  const onLoanClick = useCallback(
    id => {
      list
        .filter(i => i.expanded)
        .forEach(({id}) =>
          updateList({type: 'update', id, data: {expanded: false}})
        )
      updateList({type: 'update', id, data: {expanded: true}})
    },
    [list, updateList]
  )

  useEffect(() => {
    onChange(list)
  }, [list, onChange])

  useRouteConfig(config => {
    updateList({type: 'replaceAll', data: config.loans})
    LOAN_ID = config.loans.length
  })

  const loan = useMemo(() => consolidateLoans(list, income), [list, income])

  return (
    <>
      <div>
        <CSSTransitionGroup
          component="div"
          transitionName="loan"
          transitionEnterTimeout={250}
          transitionLeaveTimeout={250}>
          {list.map(loan => (
            <Loan
              key={loan.id}
              loan={loan}
              onChange={onLoanChange}
              onRemove={onLoanRemove}
              onClick={onLoanClick}
            />
          ))}
        </CSSTransitionGroup>
      </div>
      <div className="bg-light p-3 mb-3 d-flex rounded-bottom">
        <div className="flex-grow-1">
          {list.length} {plural(list.length, 'loan')} total
          <br />
          <strong>{currency(loan.balance)}</strong> at{' '}
          <strong>{formatFloat(loan.rate * 100)}%</strong>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          className="align-self-center"
          onClick={onLoanAdd}>
          Add another loan
        </Button>
      </div>
    </>
  )
}

LoanList.propTypes = {
  onChange: PropTypes.func,
  loans: PropTypes.array,
  income: PropTypes.object
}

export default LoanList
