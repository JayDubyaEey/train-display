import { useTime } from "@/hooks/useTime"

export function ClockDisplay() {
  const now = useTime()
  const hh = String(now.getHours()).padStart(2, "0")
  const mm = String(now.getMinutes()).padStart(2, "0")
  const ss = String(now.getSeconds()).padStart(2, "0")

  return (
    <span className="font-mono text-amber-400 led-glow tabular-nums text-5xl tracking-[0.3em]">
      {hh}:{mm}:{ss}
    </span>
  )
}
