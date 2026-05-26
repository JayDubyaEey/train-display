import { useState, useEffect } from "react"
import { fetchDepartures } from "@/lib/api"

/**
 * Fetches departures for a station and returns a sorted list of unique
 * non-null platform identifiers found in the response.
 */
export function useAvailablePlatforms(crs: string, token: string, enabled: boolean) {
  const [platforms, setPlatforms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !crs || !token) return
    setLoading(true)
    fetchDepartures(crs, token)
      .then((data) => {
        const all = [...(data.trainServices ?? []), ...(data.busServices ?? [])]
        const unique = Array.from(
          new Set(all.map((s) => s.platform).filter((p): p is string => p !== null && p !== ""))
        ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        setPlatforms(unique)
      })
      .catch(() => setPlatforms([]))
      .finally(() => setLoading(false))
  }, [crs, token, enabled])

  return { platforms, loading }
}
