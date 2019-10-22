import React, {Component} from 'react'
import {getDiscretionaryIncome, States} from '../shared/calc'

export default class DiscretionaryIncome extends Component {
  constructor(props) {
    super(props)

    this.state = {
      income: undefined,
      dependents: 1,
      state: States.LOWER_48
    }
  }

  onDependentsChange = e => {
    this.setState({dependents: parseInt(e.target.value)})
  }

  onIncomeChange = e => {
    const {value} = e.target
    this.setState({income: value ? parseInt(value) : ''})
  }

  onStateChange = e => {
    this.setState({state: e.target.value})
  }

  calcIncome() {
    const {income, dependents, state} = this.state
    if (income) {
      return getDiscretionaryIncome(income, dependents, state)
    }
  }

  render() {
    const {income, dependents, state} = this.state
    const total = this.calcIncome()

    return (
      <div>
        <h2>Discretionary Income Calculator</h2>
        <form className="form-row">
          <div className="form-group col-12">
            <label>Adjusted Gross Income</label>
            <input
              className="form-control"
              placeholder="$50,000"
              value={income || ''}
              type="number"
              onChange={this.onIncomeChange}
            />
            <small className="form-text text-muted">
              This is your taxable income from your most recent tax return.
            </small>
          </div>
          <div className="form-group col-6">
            <label>Family Size</label>
            <select
              className="form-control"
              onChange={this.onDependentsChange}
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
              onChange={this.onStateChange}
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
}
