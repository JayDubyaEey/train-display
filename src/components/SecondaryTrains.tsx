import { useState, useEffect, useRef } from "react"
import { TrainRow } from "./TrainRow"
import type { DepartureService } from "@/lib/types"

const CYCLE_MS = 15_000
const ANIM_MS = 2_000

const ORDINALS = ["2nd", "3rd", "4th", "5th"]

interface SecondaryTrainsProps {
  trains: DepartureService[]
  now: Date
}

type Phase = "idle" | "out" | "in"

/**
 * Cycles through secondary trains with a push-up animation every 15 s.
 * The outgoing row slides up and out while the incoming row pushes up from below.
 */
export function SecondaryTrains({ trains, now }: SecondaryTrainsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const [nextIndex, setNextIndex] = useState(1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset when the list length changes
  useEffect(() => {
    setActiveIndex(0)
    setPhase("idle")
  }, [trains.length])

  useEffect(() => {
    if (trains.length <= 1) return

    timerRef.current = setTimeout(() => {
      const next = (activeIndex + 1) % trains.length
      setNextIndex(next)
      setPhase("out")

      // After the animation completes, swap and return to idle
      setTimeout(() => {
        setActiveIndex(next)
        setPhase("idle")
      }, ANIM_MS)
    }, CYCLE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeIndex, trains.length])

  const activeTrain = trains[activeIndex]
  const incomingTrain = trains[nextIndex]

  if (!activeTrain) return null

  const activeOrdinal = ORDINALS[activeIndex] ?? `${activeIndex + 2}th`
  const incomingOrdinal = ORDINALS[nextIndex] ?? `${nextIndex + 2}th`

  return (
    <div className="relative overflow-hidden" style={{ height: "1.75rem" }}>
      {/* Outgoing row */}
      <div
        key={`out-${activeIndex}`}
        className={phase === "out" ? "animate-slide-out-up absolute inset-0" : "absolute inset-0"}
      >
        <TrainRow train={activeTrain} variant="secondary" now={now} ordinalPrefix={activeOrdinal} />
      </div>

      {/* Incoming row — only rendered during transition */}
      {phase === "out" && incomingTrain && (
        <div key={`in-${nextIndex}`} className="animate-slide-in-up absolute inset-0">
          <TrainRow
            train={incomingTrain}
            variant="secondary"
            now={now}
            ordinalPrefix={incomingOrdinal}
          />
        </div>
      )}
    </div>
  )
}
