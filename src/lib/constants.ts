export const HUXLEY_BASE = "https://huxley2.azurewebsites.net"

/** How often to refresh the departure board (ms) */
export const REFRESH_INTERVAL_MS = 30_000

/** Scroll speed for calling points in pixels per second */
export const CALLING_POINTS_SPEED_PX_PER_S = 92.4

/** Minimum pause between scroll cycles (ms) — text starts scrolling after this delay */
export const CALLING_POINTS_PAUSE_MS = 20_000

/** Number of trains to fetch for the platform board (1 primary + up to 2 cycling secondary) */
export const TRAINS_SHOWN = 3

/** localStorage keys */
export const STORAGE_KEYS = {
  token: "train-display:token",
  stationCrs: "train-display:station-crs",
  stationName: "train-display:station-name",
  platforms: "train-display:platforms",
} as const
