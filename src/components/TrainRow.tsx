import type { DepartureService } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TrainRowProps {
  train: DepartureService
  /** primary = large, first train. secondary = smaller, second train */
  variant: "primary" | "secondary"
}

function getStatusText(train: DepartureService): string {
  if (train.isCancelled) return "Cancelled"
  const etd = train.etd?.trim()
  if (!etd) return ""
  if (etd.toLowerCase() === "on time") return "On time"
  if (etd.toLowerCase() === "delayed") return "Delayed"
  if (etd.toLowerCase() === "cancelled") return "Cancelled"
  // It's a specific time — show it
  return etd
}

function getStatusColour(train: DepartureService): string {
  if (train.isCancelled) return "text-red-500"
  const etd = train.etd?.trim().toLowerCase()
  if (etd === "on time") return "text-amber-400"
  if (etd === "delayed" || etd === "cancelled") return "text-red-500"
  // A specific time (likely delayed)
  return "text-orange-400"
}

export function TrainRow({ train, variant }: TrainRowProps) {
  const destination =
    train.currentDestinations?.[0]?.locationName ??
    train.destination?.[0]?.locationName ??
    "Unknown"

  const via = train.destination?.[0]?.via

  const statusText = getStatusText(train)
  const statusColour = getStatusColour(train)

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
      <span className={cn("shrink-0 tracking-wider font-bold", statusColour)}>{statusText}</span>
    </div>
  )
}
