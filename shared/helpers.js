export const currency = (num, round = true) =>
  (round ? Math.round(num) : num).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  })

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
