import { useState, useEffect } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useFetch<T>(fetchFn: () => Promise<T>, deps: any[] = []) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const [refetchIndex, setRefetchIndex] = useState(0)
  const refetch = () => setRefetchIndex((prev) => prev + 1)

  useEffect(() => {
    let isMounted = true
    setState((prev) => ({ ...prev, loading: true, error: null }))

    fetchFn()
      .then((data) => {
        if (isMounted) {
          setState({ data, loading: false, error: null })
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState({ data: null, loading: false, error })
        }
      })

    return () => {
      isMounted = false
    }
  }, [...deps, refetchIndex])

  return { ...state, refetch }
}
