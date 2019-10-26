export const onChangeNumber = set => ({target: {value}}) =>
  set(value ? parseInt(value, 10) : '')

export const currency = num =>
  num.toLocaleString(undefined, {style: 'currency', currency: 'USD'})
