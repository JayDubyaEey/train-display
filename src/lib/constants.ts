export const HUXLEY_BASE = "https://huxley2.azurewebsites.net"

/** How often to refresh the departure board (ms) */
export const REFRESH_INTERVAL_MS = 30_000

/** Duration of one calling-points scroll pass (ms) — cycling happens on animation end */
export const CALLING_POINTS_SCROLL_MS = 15_000

/** Number of trains to show on the platform board */
export const TRAINS_SHOWN = 2

/** localStorage keys */
export const STORAGE_KEYS = {
  token: "train-display:token",
  stationCrs: "train-display:station-crs",
  stationName: "train-display:station-name",
  platform: "train-display:platform",
} as const
