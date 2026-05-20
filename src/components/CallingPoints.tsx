import { useState, useEffect, useRef } from "react"
import { useServiceDetails } from "@/hooks/useServiceDetails"
import { CALLING_POINTS_SPEED_PX_PER_S, CALLING_POINTS_PAUSE_MS } from "@/lib/constants"
import type { DepartureService } from "@/lib/types"

interface CallingPointsProps {
  trains: DepartureService[]
  token: string
}

export function CallingPoints({ trains, token }: CallingPointsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [cycle, setCycle] = useState(0)

  const activeTrain = trains[activeIndex]
  if (!activeTrain) return null

  function handleScrollEnd() {
    const nextIndex = (activeIndex + 1) % trains.length
    setActiveIndex(nextIndex)
    setCycle((c) => c + 1)
  }

  return (
    <CallingPointsForTrain
      key={cycle}
      train={activeTrain}
      token={token}
      showLabel={trains.length > 1}
      onScrollEnd={handleScrollEnd}
    />
  )
}

interface SingleProps {
  train: DepartureService
  token: string
  showLabel: boolean
  onScrollEnd: () => void
}

function CallingPointsForTrain({ train, token, showLabel, onScrollEnd }: SingleProps) {
  const { callingPoints, loading } = useServiceDetails(train.serviceIdUrlSafe, token, true)
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const [animStyle, setAnimStyle] = useState<React.CSSProperties>({})
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const destination =
    train.currentDestinations?.[0]?.locationName ?? train.destination?.[0]?.locationName ?? ""

  // Build calling points text — final station is uppercased
  const stops = callingPoints.map((cp, i) =>
    i === callingPoints.length - 1 ? cp.locationName.toUpperCase() : cp.locationName
  )

  const text = loading
    ? "Loading calling points..."
    : callingPoints.length === 0
      ? `Terminates at ${destination.toUpperCase()}`
      : `Calling at: ${stops.join(", ")}`

  const prefix = showLabel ? `${train.std} ${destination} — ` : ""
  const fullText = prefix + text

  // Once text is known and refs are attached, compute scroll duration from measured widths
  useEffect(() => {
    if (loading) return
    if (!containerRef.current || !textRef.current) return

    const containerW = containerRef.current.clientWidth
    const textW = textRef.current.scrollWidth
    // Total travel: text starts fully off right edge, ends fully off left edge
    const totalPx = containerW + textW
    const durationMs = (totalPx / CALLING_POINTS_SPEED_PX_PER_S) * 1000

    // Wait the pause period, then kick off the scroll
    pauseTimerRef.current = setTimeout(() => {
      setAnimStyle({
        "--marquee-duration": `${durationMs}ms`,
        animation: `marquee ${durationMs}ms linear forwards`,
      } as React.CSSProperties)
    }, CALLING_POINTS_PAUSE_MS)

    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    }
  }, [loading, fullText])

  return (
    <div ref={containerRef} className="overflow-hidden">
      <p
        ref={textRef}
        className="font-mono text-amber-300 text-sm tracking-wide led-glow whitespace-nowrap"
        style={animStyle}
        onAnimationEnd={onScrollEnd}
      >
        {fullText}
      </p>
    </div>
  )
}
