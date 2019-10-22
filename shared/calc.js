export const States = {
  LOWER_48: 'LOWER_48',
  ALASKA: 'ALASKA',
  HAWAII: 'HAWAII'
}

// 0 index is the amount for each dependent over 8 persons
// Based on: https://aspe.hhs.gov/poverty-guidelines
const FEDERAL_POVERY_LEVEL = {
  LOWER_48: [4420, 12490, 16910, 21330, 25750, 30170, 34590, 39010, 43430],
  ALASKA: [5530, 15600, 21130, 26660, 32190, 37720, 43250, 48780, 54310],
  HAWAII: [5080, 14380, 19460, 24540, 29620, 34700, 39780, 44860, 49940]
}

export const getDiscretionaryIncome = (agi, dependents = 1, state) => {
  const fpl = FEDERAL_POVERY_LEVEL[state]

  let level
  if (dependents < 9) {
    level = fpl[dependents]
  } else {
    level = fpl[8] + fpl[0] * (dependents - 8)
  }

  return Math.max(0, agi - level * 1.5)
}
