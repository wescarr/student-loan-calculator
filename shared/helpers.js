export const currency = (num, round = true) =>
  (round ? Math.round(num) : num).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  })
