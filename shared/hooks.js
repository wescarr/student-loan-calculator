const findIndex = (list, id) => list.findIndex(item => item.id === id)

export const listReducer = (state, {type, id, data}) => {
  switch (type) {
    case 'add':
      return [...state, data]
    case 'update': {
      const result = [...state]
      const index = findIndex(state, id)
      result[index] = {...result[index], ...data, id}
      return result
    }
    case 'replace': {
      const result = [...state]
      const index = findIndex(state, id)
      result[index] = {...data, id}
      return result
    }
    case 'remove': {
      const result = [...state]
      const index = findIndex(state, id)
      result.splice(index, 1)
      return result
    }
    default:
      return state
  }
}
