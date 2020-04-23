import {useRouter} from 'next/router'
import {useEffect, useRef} from 'react'

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
    case 'replaceAll': {
      return data
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

// Use this hook to initialize state from the URL query
export const useRouteConfig = callback => {
  const router = useRouter()
  const query = useRef(router.query)

  useEffect(() => {
    if (!query.current.c && router.query.c) {
      try {
        const config = JSON.parse(atob(router.query.c))
        callback(config)
      } catch (err) {
        // Ignore bad config
      }
    }

    query.current = router.query
  }, [router, callback])
}
