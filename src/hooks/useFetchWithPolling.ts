import { useState, useEffect, useCallback, useRef } from "react"

export interface PollingOptions<T> {
  fetcher: () => Promise<T>
  intervalMs: number
  enabled: boolean
}

export function useFetchWithPolling<T>({ fetcher, intervalMs, enabled }: PollingOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const run = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetcherRef.current()
      setData(result)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    run()
    const id = setInterval(run, intervalMs)
    return () => clearInterval(id)
  }, [enabled, intervalMs, run])

  return { data, error, loading, refetch: run }
}
