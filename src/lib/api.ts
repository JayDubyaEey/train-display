import { HUXLEY_BASE } from "./constants"
import type { CrsResult, DepartureBoardResponse, ServiceDetailsResponse } from "./types"

function buildUrl(path: string, token: string): string {
  const sep = path.includes("?") ? "&" : "?"
  return `${HUXLEY_BASE}${path}${sep}accessToken=${encodeURIComponent(token)}`
}

export async function fetchDepartures(crs: string, token: string): Promise<DepartureBoardResponse> {
  const url = buildUrl(`/departures/${encodeURIComponent(crs)}/20`, token)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Departures fetch failed: ${res.status}`)
  return res.json() as Promise<DepartureBoardResponse>
}

export async function fetchServiceDetails(
  serviceIdUrlSafe: string,
  token: string
): Promise<ServiceDetailsResponse> {
  const url = buildUrl(`/service/${serviceIdUrlSafe}`, token)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Service fetch failed: ${res.status}`)
  return res.json() as Promise<ServiceDetailsResponse>
}

export async function searchStations(query: string, token: string): Promise<CrsResult[]> {
  if (!query.trim()) return []
  const url = buildUrl(`/crs/${encodeURIComponent(query.trim())}`, token)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`CRS search failed: ${res.status}`)
  return res.json() as Promise<CrsResult[]>
}
