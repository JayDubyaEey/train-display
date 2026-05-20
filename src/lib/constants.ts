export const HUXLEY_BASE = "https://huxley2.azurewebsites.net"

/** How often to refresh the departure board (ms) */
export const REFRESH_INTERVAL_MS = 30_000

/** Duration of one calling-points scroll pass (ms) — cycling happens on animation end */
export const CALLING_POINTS_SCROLL_MS = 30_000

/** Number of trains to fetch for the platform board (1 primary + up to 2 cycling secondary) */
export const TRAINS_SHOWN = 3

/** localStorage keys */
export const STORAGE_KEYS = {
  token: "train-display:token",
  stationCrs: "train-display:station-crs",
  stationName: "train-display:station-name",
  platform: "train-display:platform",
} as const
