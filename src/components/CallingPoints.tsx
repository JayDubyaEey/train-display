import { useState, useEffect, useRef } from "react"
import { useServiceDetails } from "@/hooks/useServiceDetails"
import { CALLING_POINTS_SPEED_PX_PER_S, CALLING_POINTS_PAUSE_MS } from "@/lib/constants"
import type { DepartureService } from "@/lib/types"

interface CallingPointsProps {
  trains: DepartureService[]
  token: string
  stationName: string
}

export function CallingPoints({ trains, token, stationName }: CallingPointsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [cycle, setCycle] = useState(0)
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear any pending inter-scroll pause timer on unmount to avoid setState on
  // an unmounted component and the associated memory leak.
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    }
  }, [])

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
      stationName={stationName}
      showLabel={trains.length > 1}
      onScrollEnd={handleScrollEnd}
    />
  )
}

interface SingleProps {
  train: DepartureService
  token: string
  stationName: string
  showLabel: boolean
  onScrollEnd: () => void
}

function CallingPointsForTrain({ train, token, stationName, showLabel, onScrollEnd }: SingleProps) {
  const { callingPoints, previousCallingPoints, loading } = useServiceDetails(
    train.serviceIdUrlSafe,
    token,
    true
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const [animDurationMs, setAnimDurationMs] = useState<number | null>(null)
  const [marqueeFrom, setMarqueeFrom] = useState<string>("0px")
  const [marqueeTo, setMarqueeTo] = useState<string>("0px")
  const [phase, setPhase] = useState<0 | 1>(0)

  const destination =
    train.currentDestinations?.[0]?.locationName ?? train.destination?.[0]?.locationName ?? ""

  const prefix = showLabel ? `${train.std} ${destination} — ` : ""

  // Derive location: X = last stop actually called (at set), Y = next stop after it
  const lastCalledIdx = previousCallingPoints.reduce((acc, cp, i) => (cp.at !== null ? i : acc), -1)
  const lastCalled = lastCalledIdx >= 0 ? previousCallingPoints[lastCalledIdx] : null
  const nextStop =
    lastCalledIdx >= 0 && lastCalledIdx < previousCallingPoints.length - 1
      ? previousCallingPoints[lastCalledIdx + 1]
      : null

  const locationMessage: string | null =
    !loading && lastCalled
      ? `The train is currently between ${lastCalled.locationName} and ${nextStop ? nextStop.locationName : stationName}.`
      : null

  // Once text is rendered and measured, kick off the scroll immediately
  useEffect(() => {
    if (loading) return
    if (!containerRef.current || !textRef.current) return

    const containerW = containerRef.current.clientWidth
    const textW = textRef.current.scrollWidth
    const totalPx = containerW + textW
    const durationMs = (totalPx / CALLING_POINTS_SPEED_PX_PER_S) * 1000

    setMarqueeFrom(`${containerW}px`)
    setMarqueeTo(`-${textW}px`)
    setAnimDurationMs(durationMs)
  }, [loading, phase])

  // Build stop segments — if delayed, prefer et (estimated) over st (scheduled)
  const etd = train.etd?.trim().toLowerCase()
  const isDelayed = !!etd && etd !== "on time" && etd !== "cancelled" && etd !== "delayed"
  const stopSegments =
    callingPoints.length === 0
      ? null
      : callingPoints.map((cp, i) => {
          const isLast = i === callingPoints.length - 1
          const time = isDelayed ? (cp.et ?? cp.st ?? null) : (cp.st ?? cp.et ?? null)
          const timeLabel = time ? ` (${time})` : ""
          return (
            <span key={cp.locationName + i}>
              {i > 0 && ", "}
              {isLast ? (
                <span className="font-bold">
                  {cp.locationName.toUpperCase()}
                  {timeLabel}
                </span>
              ) : (
                <>
                  {cp.locationName}
                  {timeLabel}
                </>
              )}
            </span>
          )
        })

  const carriageText =
    train.length != null && train.length > 0
      ? `. This train is formed of ${train.length} carriages.`
      : ""

  const callingPointsContent = loading ? (
    "Loading calling points..."
  ) : callingPoints.length === 0 ? (
    <>
      A {train.operator} service. Terminates at{" "}
      <span className="font-bold">{destination.toUpperCase()}</span>
      {carriageText}
    </>
  ) : (
    <>
      A {train.operator} service. Calling at {stopSegments}
      {carriageText}
    </>
  )

  // Phase 0 = calling points, phase 1 = location (only if available)
  const showLocationPhase = phase === 1 && !!locationMessage
  const content = showLocationPhase ? locationMessage! : callingPointsContent

  function handleAnimationEnd() {
    if (phase === 0 && locationMessage) {
      // Reset animation state then switch to location phase
      setAnimDurationMs(null)
      setPhase(1)
    } else {
      // Done with all phases — advance to next train
      setAnimDurationMs(null)
      setPhase(0)
      onScrollEnd()
    }
  }

  // Hidden until the duration is computed (text is measured), then scroll starts
  const style: React.CSSProperties =
    animDurationMs != null
      ? ({
          animation: `marquee ${animDurationMs}ms linear forwards`,
          "--marquee-from": marqueeFrom,
          "--marquee-to": marqueeTo,
        } as React.CSSProperties)
      : { visibility: "hidden" }

  return (
    <div ref={containerRef} className="overflow-hidden h-7 relative">
      <div
        className="absolute left-0 top-0 h-full w-6 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, black, transparent)" }}
      />
      <p
        key={phase}
        ref={textRef}
        className="font-mono font-bold text-amber-400 text-xl tracking-wide led-glow whitespace-nowrap"
        style={style}
        onAnimationEnd={handleAnimationEnd}
      >
        {!showLocationPhase && prefix}
        {content}
      </p>
    </div>
  )
}
