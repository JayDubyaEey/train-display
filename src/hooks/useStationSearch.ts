import { useState, useCallback, useRef } from "react"
import { searchStations } from "@/lib/api"
import type { CrsResult } from "@/lib/types"

export function useStationSearch(token: string) {
  const [results, setResults] = useState<CrsResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (!query.trim()) {
        setResults([])
        return
      }
      debounceRef.current = setTimeout(async () => {
        setLoading(true)
        try {
          const data = await searchStations(query, token)
          setResults(data.slice(0, 10))
          setError(null)
        } catch (e) {
          setError(e instanceof Error ? e.message : "Search failed")
        } finally {
          setLoading(false)
        }
      }, 300)
    },
    [token]
  )

  const clear = useCallback(() => setResults([]), [])

  return { results, loading, error, search, clear }
}
