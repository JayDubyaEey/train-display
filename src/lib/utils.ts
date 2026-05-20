import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DepartureService } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a "HH:MM" time string into a Date relative to `now`,
 * handling midnight roll-over (if the time appears >2 h in the past,
 * it is assumed to be tomorrow).
 */
export function parseHHMM(hhmm: string, now: Date): Date {
  const [hh, mm] = hhmm.split(":").map(Number)
  const d = new Date(now)
  d.setHours(hh, mm, 0, 0)
  if (now.getTime() - d.getTime() > 2 * 60 * 60 * 1000) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

/**
 * Returns true if the train's expected departure time is in the past.
 */
export function hasDeparted(train: DepartureService, now: Date): boolean {
  if (train.isCancelled) return false
  const etd = train.etd?.trim().toLowerCase()
  if (!etd || etd === "delayed" || etd === "cancelled") return false
  const timeStr = etd === "on time" ? train.std : (train.etd?.trim() ?? train.std)
  if (!/^\d{1,2}:\d{2}$/.test(timeStr)) return false
  return parseHHMM(timeStr, now).getTime() < now.getTime()
}
