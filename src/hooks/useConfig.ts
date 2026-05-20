import { useState, useEffect, useCallback, useRef } from "react"
import { STORAGE_KEYS } from "@/lib/constants"
import type { DisplayConfig } from "@/lib/types"

function readConfig(): Partial<DisplayConfig> {
  return {
    token: localStorage.getItem(STORAGE_KEYS.token) ?? "",
    stationCrs: localStorage.getItem(STORAGE_KEYS.stationCrs) ?? "",
    stationName: localStorage.getItem(STORAGE_KEYS.stationName) ?? "",
    platform: localStorage.getItem(STORAGE_KEYS.platform) ?? "",
  }
}

export function useConfig() {
  const [config, setConfigState] = useState<Partial<DisplayConfig>>(readConfig)

  const isConfigured = !!config.token && !!config.stationCrs && config.platform !== undefined

  const saveConfig = useCallback((next: DisplayConfig) => {
    localStorage.setItem(STORAGE_KEYS.token, next.token)
    localStorage.setItem(STORAGE_KEYS.stationCrs, next.stationCrs)
    localStorage.setItem(STORAGE_KEYS.stationName, next.stationName)
    localStorage.setItem(STORAGE_KEYS.platform, next.platform)
    setConfigState(next)
  }, [])

  const clearConfig = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
    setConfigState({})
  }, [])

  return { config, isConfigured, saveConfig, clearConfig }
}

// ─── Polling abstraction (mirrors dashboard's useFetchWithPolling) ─────────────

interface PollingOptions<T> {
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
