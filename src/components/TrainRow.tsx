import type { DepartureService } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TrainRowProps {
  train: DepartureService
  /** primary = large, first train. secondary = smaller, second train */
  variant: "primary" | "secondary"
  now: Date
}

/**
 * Parse a "HH:MM" time string into today's Date, handling midnight roll-over.
 * If the resulting time is more than 2 hours in the past it's assumed to be
 * a train departing after midnight.
 */
function parseHHMM(hhmm: string, now: Date): Date {
  const [hh, mm] = hhmm.split(":").map(Number)
  const d = new Date(now)
  d.setHours(hh, mm, 0, 0)
  // If the time appears >2 h in the past, assume it's tomorrow
  if (now.getTime() - d.getTime() > 2 * 60 * 60 * 1000) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

interface StatusResult {
  text: string
  colour: string
}

function getStatus(train: DepartureService, now: Date): StatusResult {
  if (train.isCancelled) return { text: "Cancelled", colour: "text-red-500" }

  const etd = train.etd?.trim().toLowerCase()

  if (etd === "cancelled") return { text: "Cancelled", colour: "text-red-500" }
  if (etd === "delayed") return { text: "Delayed", colour: "text-red-500" }

  // Determine the actual expected departure time string (HH:MM)
  const expectedTimeStr = !etd || etd === "on time" ? train.std : (train.etd?.trim() ?? train.std)

  // Validate it looks like a time
  if (!/^\d{1,2}:\d{2}$/.test(expectedTimeStr)) {
    // Fallback — just show the raw etd value
    return { text: expectedTimeStr, colour: "text-amber-400" }
  }

  const departure = parseHHMM(expectedTimeStr, now)
  const diffMs = departure.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60_000)

  const isDelayed = etd !== "on time" && !!etd && etd !== train.std.toLowerCase()

  if (diffMins < 0) return { text: "Departed", colour: "text-zinc-500" }
  if (diffMins === 0)
    return { text: "Due", colour: isDelayed ? "text-orange-400" : "text-amber-400" }

  const label = `${diffMins}m`
  return {
    text: label,
    colour: isDelayed ? "text-orange-400" : "text-amber-400",
  }
}

export function TrainRow({ train, variant, now }: TrainRowProps) {
  const destination =
    train.currentDestinations?.[0]?.locationName ??
    train.destination?.[0]?.locationName ??
    "Unknown"

  const via = train.destination?.[0]?.via

  const { text: statusText, colour: statusColour } = getStatus(train, now)

  const isPrimary = variant === "primary"

  return (
    <div
      className={cn(
        "flex items-baseline gap-3 font-mono led-glow",
        isPrimary ? "text-amber-400 text-2xl" : "text-amber-400/80 text-base"
      )}
    >
      {/* Scheduled time */}
      <span className="tabular-nums shrink-0 tracking-widest font-bold">{train.std}</span>

      {/* Destination */}
      <span className="flex-1 truncate tracking-wider font-bold">
        {destination}
        {via && (
          <span className={cn("font-normal ml-2", isPrimary ? "text-base" : "text-sm")}>{via}</span>
        )}
      </span>

      {/* Platform */}
      {train.platform && (
        <span className="shrink-0 tracking-wider">
          Plat <span className="font-bold">{train.platform}</span>
        </span>
      )}

      {/* Status */}
      <span className={cn("shrink-0 tracking-wider font-bold tabular-nums", statusColour)}>
        {statusText}
      </span>
    </div>
  )
}
