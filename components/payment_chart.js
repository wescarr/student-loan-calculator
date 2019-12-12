import PropTypes from 'prop-types'
import React, {useState} from 'react'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import dynamic from 'next/dynamic'
import {currency, hexToRgbA, simplifyCurrency} from '../shared/helpers'

const BarChart = dynamic(import('react-chartjs-2').then(mod => mod.Bar))

const getYearBreakdown = (breakdown, attr) => {
  const years = []
  for (let i = 12; i <= breakdown.length; i += 12) {
    years.push(breakdown[i - 1][attr])
  }

  return years
}

const dataset = (label, data, bgColor) => ({
  label,
  data,
  fill: 'origin',
  lineTension: 0.1,
  borderColor: bgColor,
  backgroundColor: hexToRgbA(bgColor, 0.8),
  hoverBackgroundColor: hexToRgbA(bgColor, 1),
  borderWidth: 0,
  pointRadius: 0,
  pointHitRadius: 5,
  pointBackgroundColor: bgColor
})

const chartOptions = {
  legend: {display: false},
  scales: {
    xAxes: [
      {
        ticks: {
          callback: n => new Date().getFullYear() + parseInt(n) - 1,
          min: 0
        }
      }
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          // Write simplified dollar values like "$10k" or "$1.2m"
          callback: simplifyCurrency,
          min: 0
        }
      }
    ]
  },
  tooltips: {
    // Draws tooltips whenever the mouse hovers over the chart. This is
    // useful because we draw the same tooltip for each bar in a "bar" in a
    // group of bars and it is a bit jarring to continually redraw the same
    // tooltip as the mouse moves across the bars.
    intersect: false,
    // This includes every dataset in a group of bars inside the tooltip.
    mode: 'index',
    displayColors: false,
    callbacks: {
      label: (item, data) =>
        `${data.datasets[item.datasetIndex].label}: ${currency(item.yLabel)}`,
      title: item => `Year ${item[0].label}`
    }
  }
}

const getChartData = (repayments, attr) => {
  const datasets = repayments
    .filter(r => r.eligible)
    .map(r => dataset(r.label, getYearBreakdown(r.breakdown, attr), r.color))

  // Find largest data set to construct labels
  let max = 0
  datasets.forEach(d => {
    if (d.data.length > max) {
      max = d.data.length
    }
  })

  const data = {
    datasets,
    labels: new Array(max).fill(0).map((r, i) => `${i + 1}`)
  }

  return data
}

const Chart = ({payments}) => {
  const [compare, setCompare] = useState('endingBalance')
  const data = getChartData(payments, compare)

  return (
    <>
      <div className="mt-4 mb-2 text-center">
        <ToggleButtonGroup
          type="radio"
          name="chart_type"
          value={compare}
          onChange={setCompare}>
          <ToggleButton value={'payment'} variant="secondary">
            Monthly payment
          </ToggleButton>
          <ToggleButton value={'endingBalance'} variant="secondary">
            Balance
          </ToggleButton>
          <ToggleButton value={'totalPayment'} variant="secondary">
            Total paid
          </ToggleButton>
          <ToggleButton value={'totalInterest'} variant="secondary">
            Total interest
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <BarChart data={data} options={chartOptions} height={100} width={300} />
    </>
  )
}

Chart.propTypes = {
  payments: PropTypes.array
}

export default Chart
