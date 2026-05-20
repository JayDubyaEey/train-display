import { useState } from "react"
import { useServiceDetails } from "@/hooks/useServiceDetails"
import { CALLING_POINTS_SCROLL_MS } from "@/lib/constants"
import type { DepartureService } from "@/lib/types"

interface CallingPointsProps {
  trains: DepartureService[]
  token: string
}

export function CallingPoints({ trains, token }: CallingPointsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const activeTrain = trains[activeIndex]
  if (!activeTrain) return null

  function handleAnimationEnd() {
    if (trains.length > 1) {
      setActiveIndex((i) => (i + 1) % trains.length)
    }
  }

  return (
    <CallingPointsForTrain
      key={`${activeTrain.serviceID}-${activeIndex}`}
      train={activeTrain}
      token={token}
      showLabel={trains.length > 1}
      scrollDurationMs={CALLING_POINTS_SCROLL_MS}
      onScrollEnd={handleAnimationEnd}
    />
  )
}

interface SingleProps {
  train: DepartureService
  token: string
  showLabel: boolean
  scrollDurationMs: number
  onScrollEnd: () => void
}

function CallingPointsForTrain({
  train,
  token,
  showLabel,
  scrollDurationMs,
  onScrollEnd,
}: SingleProps) {
  const { callingPoints, loading } = useServiceDetails(train.serviceIdUrlSafe, token, true)

  const destination =
    train.currentDestinations?.[0]?.locationName ?? train.destination?.[0]?.locationName ?? ""

  const text = loading
    ? "Loading calling points..."
    : callingPoints.length === 0
      ? `Terminates at ${destination}`
      : `Calling at: ${callingPoints.map((cp) => cp.locationName).join(", ")}`

  const prefix = showLabel ? `${train.std} ${destination} — ` : ""

  return (
    <div className="overflow-hidden">
      <p
        className="font-mono text-amber-300 text-sm tracking-wide led-glow whitespace-nowrap animate-marquee"
        style={{ "--marquee-duration": `${scrollDurationMs}ms` } as React.CSSProperties}
        onAnimationEnd={onScrollEnd}
      >
        {prefix}
        {text}
      </p>
    </div>
  )
}
