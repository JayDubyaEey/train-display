import { useState, useEffect } from "react"
import { useServiceDetails } from "@/hooks/useServiceDetails"
import { CALLING_POINTS_CYCLE_MS } from "@/lib/constants"
import type { DepartureService } from "@/lib/types"

interface CallingPointsProps {
  trains: DepartureService[]
  token: string
}

/**
 * Fetches calling points for each train and cycles through them.
 * Displays "Calling at: Stop A, Stop B, Stop C"
 */
export function CallingPoints({ trains, token }: CallingPointsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Cycle between trains
  useEffect(() => {
    if (trains.length <= 1) {
      setActiveIndex(0)
      return
    }
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % trains.length)
    }, CALLING_POINTS_CYCLE_MS)
    return () => clearInterval(id)
  }, [trains.length])

  const activeTrain = trains[activeIndex]

  if (!activeTrain) return null

  return (
    <CallingPointsForTrain
      key={activeTrain.serviceID}
      train={activeTrain}
      token={token}
      showLabel={trains.length > 1}
    />
  )
}

interface SingleProps {
  train: DepartureService
  token: string
  showLabel: boolean
}

function CallingPointsForTrain({ train, token, showLabel }: SingleProps) {
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
        className="font-mono text-amber-300 text-sm tracking-wide led-glow whitespace-nowrap
                   animate-marquee"
        style={{ "--marquee-text": JSON.stringify(prefix + text) } as React.CSSProperties}
      >
        {prefix}
        {text}
      </p>
    </div>
  )
}
