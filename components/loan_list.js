import Button from 'react-bootstrap/Button'
import Loan from './loan'
import PropTypes from 'prop-types'
import React, {useCallback, useEffect, useMemo, useReducer} from 'react'
import ReactCssTransition from 'react-addons-css-transition-group'
import {consolidateLoans} from '../shared/calc'
import {currency, plural} from '../shared/helpers'
import {listReducer} from '../shared/hooks'

let LOAN_ID = 1

const LoanList = ({loans, onChange}) => {
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

  useEffect(() => onChange(list), [list, onChange])

  const loan = useMemo(() => consolidateLoans(list), [list])

  return (
    <>
      <div>
        <ReactCssTransition
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
        </ReactCssTransition>
      </div>
      <div className="bg-light p-3 mb-3 d-flex rounded-bottom">
        <div className="flex-grow-1">
          {list.length} {plural(list.length, 'loan')} total
          <br />
          <strong>{currency(loan.balance)}</strong> at{' '}
          <strong>{(loan.rate * 100).toFixed(2)}%</strong>
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
  loans: PropTypes.array
}

export default LoanList
