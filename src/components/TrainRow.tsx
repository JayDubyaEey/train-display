import type { DepartureService } from "@/lib/types"
import { cn, parseHHMM } from "@/lib/utils"

interface TrainRowProps {
  train: DepartureService
  variant: "primary" | "secondary"
  now: Date
  /** Optional ordinal label shown before the time, e.g. "2nd" or "3rd" */
  ordinalPrefix?: string
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

  const expectedTimeStr = !etd || etd === "on time" ? train.std : (train.etd?.trim() ?? train.std)

  if (!/^\d{1,2}:\d{2}$/.test(expectedTimeStr)) {
    return { text: expectedTimeStr, colour: "text-amber-400" }
  }

  const departure = parseHHMM(expectedTimeStr, now)
  const diffMs = departure.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60_000)

  const isDelayed = etd !== "on time" && !!etd && etd !== train.std.toLowerCase()

  if (diffMins < 0) return { text: "Departed", colour: "text-zinc-500" }
  if (diffMins === 0)
    return { text: "Due", colour: isDelayed ? "text-orange-400" : "text-amber-400" }

  return {
    text: `${diffMins}m`,
    colour: isDelayed ? "text-orange-400" : "text-amber-400",
  }
}

export function TrainRow({ train, variant, now, ordinalPrefix }: TrainRowProps) {
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
        "flex items-baseline gap-3 font-mono led-glow text-amber-400 text-xl",
        !isPrimary && "opacity-80"
      )}
    >
      {/* Ordinal prefix e.g. "2nd" */}
      {ordinalPrefix && (
        <span className="shrink-0 text-amber-700 text-xs font-normal tracking-wider w-7">
          {ordinalPrefix}
        </span>
      )}

      {/* Scheduled time */}
      <span className="tabular-nums shrink-0 tracking-widest font-bold">{train.std}</span>

      {/* Destination */}
      <span className="flex-1 truncate tracking-wider font-bold">
        {destination}
        {via && <span className="font-normal ml-2 text-base">{via}</span>}
      </span>

      {/* Status */}
      <span className={cn("shrink-0 tracking-wider font-bold tabular-nums", statusColour)}>
        {statusText}
      </span>
    </div>
  )
}
