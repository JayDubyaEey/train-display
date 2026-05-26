import { useState, useEffect, useRef } from "react"
import { CALLING_POINTS_SPEED_PX_PER_S } from "@/lib/constants"

interface NrccMessageProps {
  message: string
  onScrollEnd: () => void
}

export function NrccMessage({ message, onScrollEnd }: NrccMessageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const [animDurationMs, setAnimDurationMs] = useState<number | null>(null)
  const [marqueeFrom, setMarqueeFrom] = useState<string>("0px")
  const [marqueeTo, setMarqueeTo] = useState<string>("0px")

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return
    const containerW = containerRef.current.clientWidth
    const textW = textRef.current.scrollWidth
    const totalPx = containerW + textW
    const durationMs = (totalPx / CALLING_POINTS_SPEED_PX_PER_S) * 1000
    setMarqueeFrom(`${containerW}px`)
    setMarqueeTo(`-${textW}px`)
    setAnimDurationMs(durationMs)
  }, [message])

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
        ref={textRef}
        className="font-mono font-bold text-amber-400 text-xl tracking-wide led-glow whitespace-nowrap"
        style={style}
        onAnimationEnd={onScrollEnd}
      >
        Information: {message}
      </p>
    </div>
  )
}
