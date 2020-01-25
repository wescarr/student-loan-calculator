import PropTypes from 'prop-types'
import React from 'react'
import dynamic from 'next/dynamic'
import {currency, hexToRgbA, simplifyCurrency} from '../shared/helpers'

const LineChart = dynamic(import('react-chartjs-2').then(mod => mod.Line))

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
  legend: {display: false},
  scales: {
    xAxes: [
      {
        gridLines: {display: false},
        ticks: {
          display: false,
          callback: n =>
            n % 2 ? new Date().getFullYear() + parseInt(n) - 1 : '',
          min: 0
        }
      }
    ],
    yAxes: [
      {
        gridLines: {display: false},
        ticks: {
          // padding: -30,
          beginAtZero: true,
          callback: (value, index, values) =>
            // Show alternate values, starting with labels > 0
            index % 2 === values.length % 2 ? simplifyCurrency(value) : '',
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

const Chart = ({payments, compare, options}) => {
  const data = getChartData(payments, compare)

  return <LineChart data={data} options={chartOptions} {...options} />
}

Chart.propTypes = {
  payments: PropTypes.array,
  compare: PropTypes.string.isRequired,
  options: PropTypes.object
}

export default Chart
