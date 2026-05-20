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
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeTrain = trains[activeIndex]
  if (!activeTrain) return null

  // Called when a scroll finishes — wait the pause, then advance to next cycle
  function handleScrollEnd() {
    pauseTimerRef.current = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % trains.length
      setActiveIndex(nextIndex)
      setCycle((c) => c + 1)
    }, CALLING_POINTS_PAUSE_MS)
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
  const [animDurationMs, setAnimDurationMs] = useState<number | null>(null)

  const destination =
    train.currentDestinations?.[0]?.locationName ?? train.destination?.[0]?.locationName ?? ""

  const prefix = showLabel ? `${train.std} ${destination} — ` : ""

  // Once text is rendered and measured, kick off the scroll immediately
  useEffect(() => {
    if (loading) return
    if (!containerRef.current || !textRef.current) return

    const containerW = containerRef.current.clientWidth
    const textW = textRef.current.scrollWidth
    const totalPx = containerW + textW
    const durationMs = (totalPx / CALLING_POINTS_SPEED_PX_PER_S) * 1000

    setAnimDurationMs(durationMs)
  }, [loading])

  // Build stop segments — all stops except last are plain, last is bold + uppercase
  const stopSegments =
    callingPoints.length === 0
      ? null
      : callingPoints.map((cp, i) => {
          const isLast = i === callingPoints.length - 1
          return (
            <span key={cp.locationName + i}>
              {i > 0 && ", "}
              {isLast ? (
                <span className="font-bold">{cp.locationName.toUpperCase()}</span>
              ) : (
                cp.locationName
              )}
            </span>
          )
        })

  const carriageText =
    train.length != null && train.length > 0
      ? `. This train is formed of ${train.length} carriages`
      : ""

  const content = loading ? (
    "Loading calling points..."
  ) : callingPoints.length === 0 ? (
    <>
      Terminates at <span className="font-bold">{destination.toUpperCase()}</span>
      {carriageText}
    </>
  ) : (
    <>
      Calling at: {stopSegments}
      {carriageText}
    </>
  )

  // Hidden until the duration is computed (text is measured), then scroll starts
  const style: React.CSSProperties =
    animDurationMs != null
      ? { animation: `marquee ${animDurationMs}ms linear forwards` }
      : { visibility: "hidden" }

  return (
    <div ref={containerRef} className="overflow-hidden h-7">
      <p
        ref={textRef}
        className="font-mono text-amber-400 text-xl tracking-wide led-glow whitespace-nowrap"
        style={style}
        onAnimationEnd={onScrollEnd}
      >
        {prefix}
        {content}
      </p>
    </div>
  )
}
