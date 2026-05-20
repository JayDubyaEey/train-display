import { useRef, useState } from "react"

interface InfoTickerProps {
  messages: string[]
  staticMessage?: string
}

/**
 * Scrolling information ticker — mirrors the bottom bar on real platform displays.
 * Cycles through messages (NRE disruption notices, or a default message).
 */
export function InfoTicker({ messages, staticMessage }: InfoTickerProps) {
  const allMessages = messages.length > 0 ? messages : [staticMessage ?? ""]
  const [index, setIndex] = useState(0)
  const spanRef = useRef<HTMLSpanElement>(null)

  // Advance to next message when the scroll animation ends
  function handleAnimationEnd() {
    setIndex((i) => (i + 1) % allMessages.length)
  }

  // Re-trigger animation by remounting (key change) when index changes
  const message = allMessages[index]

  return (
    <div className="border-t border-amber-900/40 overflow-hidden py-1.5 px-1 bg-black/60">
      <div className="flex items-center gap-3">
        <span className="font-mono text-amber-500 text-xs tracking-widest uppercase shrink-0 led-glow">
          Info
        </span>
        <div className="overflow-hidden flex-1">
          <span
            key={index}
            ref={spanRef}
            onAnimationEnd={handleAnimationEnd}
            className="font-mono text-amber-300 text-xs tracking-wide whitespace-nowrap
                       inline-block animate-ticker led-glow"
          >
            {message}
          </span>
        </div>
      </div>
    </div>
  )
}
