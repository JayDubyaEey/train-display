import { useCallback } from "react"
import { fetchDepartures } from "@/lib/api"
import { REFRESH_INTERVAL_MS, TRAINS_SHOWN } from "@/lib/constants"
import { useFetchWithPolling } from "./useFetchWithPolling"
import type { DepartureService, DepartureBoardResponse } from "@/lib/types"

export interface DeparturesResult {
  boardInfo: Pick<DepartureBoardResponse, "locationName" | "crs" | "nrccMessages"> | null
  trains: DepartureService[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDepartures(
  crs: string,
  token: string,
  platform: string,
  enabled: boolean
): DeparturesResult {
  const fetcher = useCallback(() => fetchDepartures(crs, token), [crs, token])

  const { data, loading, error, refetch } = useFetchWithPolling({
    fetcher,
    intervalMs: REFRESH_INTERVAL_MS,
    enabled,
  })

  const allTrains = data?.trainServices ?? []
  const filtered = platform ? allTrains.filter((t) => t.platform === platform) : allTrains
  const trains = filtered.slice(0, TRAINS_SHOWN)

  const boardInfo = data
    ? { locationName: data.locationName, crs: data.crs, nrccMessages: data.nrccMessages }
    : null

  return { boardInfo, trains, loading, error, refetch }
}
