import Button from 'react-bootstrap/Button'
import Loan from './loan'
import PropTypes from 'prop-types'
import React, {useCallback, useEffect, useReducer} from 'react'
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

  return (
    <div className="pb-3">
      {list.map(loan => (
        <Loan
          key={loan.id}
          loan={loan}
          onChange={onLoanChange}
          onRemove={onLoanRemove}
          onClick={onLoanClick}
        />
      ))}
      <Button variant="outline-primary" size="sm" onClick={onLoanAdd}>
        Add another loan
      </Button>
    </div>
  )
}

LoanList.propTypes = {
  onChange: PropTypes.func,
  loans: PropTypes.array
}

export default LoanList
