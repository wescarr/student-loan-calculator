export const onChangeNumber = set => ({target: {value}}) =>
  set(value ? parseFloat(value, 10) : '')

export const currency = (num, round = true) =>
  (round ? Math.round(num) : num).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  })
