// ─── Huxley2 API response types ───────────────────────────────────────────────

export interface CrsResult {
  stationName: string
  crsCode: string
}

export interface ServiceLocation {
  locationName: string
  crs: string | null
  via: string | null
  futureChangeTo: string | null
  assocIsCancelled: boolean
}

export interface DepartureService {
  /** Scheduled time of departure, e.g. "16:45" */
  std: string
  /** Estimated time of departure, e.g. "On time" | "16:47" | "Delayed" | "Cancelled" */
  etd: string
  platform: string | null
  operator: string
  operatorCode: string
  isCancelled: boolean
  cancelReason: string | null
  delayReason: string | null
  serviceID: string
  serviceIdUrlSafe: string
  destination: ServiceLocation[]
  origin: ServiceLocation[]
  currentDestinations: ServiceLocation[] | null
  adhocAlerts: string[] | null
  length: number | null
  isCircularRoute: boolean
}

export interface DepartureBoardResponse {
  generatedAt: string
  locationName: string
  crs: string
  nrccMessages: Array<{ value: string }> | null
  trainServices: DepartureService[] | null
  busServices: DepartureService[] | null
}

export interface CallingPoint {
  locationName: string
  crs: string | null
  st: string | null
  et: string | null
  at: string | null
  isCancelled: boolean
  length: number | null
}

export interface CallingPointList {
  callingPoint: CallingPoint[]
  serviceType: number
  serviceChangeRequired: boolean
  assocIsCancelled: boolean
}

export interface ServiceDetailsResponse {
  generatedAt: string
  serviceType: number
  locationName: string
  crs: string
  operator: string
  operatorCode: string
  isCancelled: boolean
  cancelReason: string | null
  delayReason: string | null
  overdueMessage: string | null
  length: number | null
  destination: ServiceLocation[]
  origin: ServiceLocation[]
  previousCallingPoints: CallingPointList[] | null
  subsequentCallingPoints: CallingPointList[] | null
}

// ─── App-level config ──────────────────────────────────────────────────────────

export interface DisplayConfig {
  token: string
  stationCrs: string
  stationName: string
  /** One or more platform identifiers to display; empty array means all platforms */
  platforms: string[]
}
