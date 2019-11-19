export const currency = (num, round = true) =>
  (round ? Math.round(num) : num).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  })

export const simplifyCurrency = amount => {
  let remaining = amount,
    index = 0
  while (remaining >= 1000) {
    remaining /= 1000
    index++
  }

  return `${currency(remaining, false)}${['', 'k', 'm', 'B', 'T'][index]}`
}

export const hexToRgbA = (hex, alpha) => {
  hex = hex.replace(/\D/, '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const classNames = classes =>
  Object.entries(classes)
    .map(([name, truthy]) => truthy && name)
    .join(' ')
