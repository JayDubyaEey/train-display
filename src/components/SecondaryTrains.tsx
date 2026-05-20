import { useState, useEffect, useRef } from "react"
import { TrainRow } from "./TrainRow"
import type { DepartureService } from "@/lib/types"

const CYCLE_MS = 15_000
const FADE_MS = 400

const ORDINALS = ["2nd", "3rd", "4th", "5th"]

interface SecondaryTrainsProps {
  trains: DepartureService[]
  now: Date
}

/**
 * Cycles through a list of secondary trains with a fade transition every 15 s.
 * Each train is labelled with an ordinal prefix (2nd, 3rd, …).
 */
export function SecondaryTrains({ trains, now }: SecondaryTrainsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset to first train whenever the list changes (e.g. a departed train is removed)
  useEffect(() => {
    setActiveIndex(0)
    setVisible(true)
  }, [trains.length])

  useEffect(() => {
    if (trains.length <= 1) return

    timerRef.current = setTimeout(() => {
      // Fade out
      setVisible(false)
      setTimeout(() => {
        setActiveIndex((i) => (i + 1) % trains.length)
        // Fade in
        setVisible(true)
      }, FADE_MS)
    }, CYCLE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeIndex, trains.length])

  const train = trains[activeIndex]
  if (!train) return null

  // The ordinal offset: secondary trains start at index 1 of the full board (i.e. "2nd")
  const ordinal = ORDINALS[activeIndex] ?? `${activeIndex + 2}th`

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
      }}
    >
      <TrainRow train={train} variant="secondary" now={now} ordinalPrefix={ordinal} />
    </div>
  )
}
