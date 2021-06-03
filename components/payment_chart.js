import PropTypes from 'prop-types'
import React from 'react'
import {currency, hexToRgbA, simplifyCurrency} from '../shared/helpers'
import {Line as LineChart} from 'react-chartjs-2'

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
  backgroundColor: hexToRgbA(bgColor, 0.1),
  hoverBackgroundColor: hexToRgbA(bgColor, 1),
  borderWidth: 2,
  pointRadius: 0,
  pointHitRadius: 5,
  pointBackgroundColor: bgColor
})

const chartOptions = {
  plugins: {
    legend: {display: false},
    tooltip: {
      // Draws tooltips whenever the mouse hovers over the chart. This is
      // useful because we draw the same tooltip for each bar in a "bar" in a
      // group of bars and it is a bit jarring to continually redraw the same
      // tooltip as the mouse moves across the bars.
      intersect: false,
      // This includes every dataset in a group of bars inside the tooltip.
      mode: 'index',
      displayColors: false,
      callbacks: {
        label: ctx => `${ctx.dataset.label}: ${currency(ctx.raw)}`,
        title: ctx => `Year ${ctx[0].label}`
      }
    }
  },
  scales: {
    x: {
      min: 0,
      grid: {display: false, drawBorder: false},
      ticks: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      min: 0,
      grid: {display: false, drawBorder: false},
      ticks: {
        callback: (value, index) =>
          index > 0 && index % 2 ? simplifyCurrency(value) : null
      }
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

const Chart = ({payments, compare, options}) => (
  <LineChart
    data={getChartData(payments, compare)}
    options={chartOptions}
    {...options}
  />
)

Chart.propTypes = {
  payments: PropTypes.array,
  compare: PropTypes.string.isRequired,
  options: PropTypes.object
}

export default Chart
