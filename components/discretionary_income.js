import React, {useCallback, useState} from 'react'
import {getDiscretionaryIncome, States} from '../shared/calc'

const onChangeNumber = set => ({target: {value}}) =>
  set(value ? parseInt(value, 10) : '')

const DiscretionaryIncome = props => {
  const [income, setIncome] = useState('')
  const onChangeIncome = useCallback(onChangeNumber(setIncome), [setIncome])

  const [dependents, setDependents] = useState(1)
  const onChangeDependants = useCallback(onChangeNumber(setDependents), [
    setDependents
  ])

  const [state, setState] = useState(States.LOWER_48)
  const onChangeState = useCallback(({target: {value}}) => setState(value), [
    setState
  ])

  const total = income && getDiscretionaryIncome(income, dependents, state)

  return (
    <div {...props}>
      <h2>Discretionary Income Calculator</h2>
      <form className="form-row">
        <div className="form-group col-12">
          <label>Adjusted Gross Income</label>
          <input
            className="form-control"
            placeholder="$50,000"
            value={income}
            type="number"
            onChange={onChangeIncome}
          />
          <small className="form-text text-muted">
            This is your taxable income from your most recent tax return.
          </small>
        </div>
        <div className="form-group col-6">
          <label>Family Size</label>
          <select
            className="form-control"
            onChange={onChangeDependants}
            value={dependents}>
            {new Array(15).fill(1).map((value, index) => (
              <option key={index} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group col-6">
          <label>State</label>
          <select
            className="form-control"
            onChange={onChangeState}
            value={state}>
            <option value={States.LOWER_48}>Lower 48</option>
            <option value={States.ALASKA}>Alaska</option>
            <option value={States.HAWAII}>Hawaii</option>
          </select>
        </div>
      </form>
      {income && <h1>${total.toLocaleString()}</h1>}
      <style jsx>{`
        h1,
        h2 {
          text-align: center;
        }

        h2 {
          margin: 40px 0;
        }
      `}</style>
    </div>
  )
}

export default DiscretionaryIncome
