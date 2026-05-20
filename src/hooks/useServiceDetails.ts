import { useCallback } from "react"
import { fetchServiceDetails } from "@/lib/api"
import { useFetchWithPolling } from "./useConfig"
import type { CallingPoint } from "@/lib/types"

export function useServiceDetails(serviceIdUrlSafe: string, token: string, enabled: boolean) {
  const fetcher = useCallback(
    () => fetchServiceDetails(serviceIdUrlSafe, token),
    [serviceIdUrlSafe, token]
  )

  const { data, loading, error } = useFetchWithPolling({
    fetcher,
    // Service details don't need rapid polling — refresh every 60s
    intervalMs: 60_000,
    enabled,
  })

  const callingPoints: CallingPoint[] = data?.subsequentCallingPoints?.[0]?.callingPoint ?? []

  return { callingPoints, loading, error }
}
