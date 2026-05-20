import { Settings, RefreshCw } from "lucide-react"
import { ClockDisplay } from "./ClockDisplay"
import { TrainRow } from "./TrainRow"
import { CallingPoints } from "./CallingPoints"
import { InfoTicker } from "./InfoTicker"
import type { DisplayConfig } from "@/lib/types"
import { useDepartures } from "@/hooks/useDepartures"
import { useTime } from "@/hooks/useTime"

interface PlatformDisplayProps {
  config: DisplayConfig
  onOpenSettings: () => void
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function PlatformDisplay({ config, onOpenSettings }: PlatformDisplayProps) {
  const now = useTime()
  const { boardInfo, trains, loading, error, refetch } = useDepartures(
    config.stationCrs,
    config.token,
    config.platform,
    true
  )

  const stationLabel = boardInfo?.locationName ?? config.stationName
  const platformLabel = config.platform ? `Platform ${config.platform}` : "All Platforms"

  // Extract NRCC messages (strip HTML tags National Rail includes)
  const nrccMessages = (boardInfo?.nrccMessages ?? []).map((m) => stripHtml(m.value))

  const defaultTickerMsg = `${stationLabel} — ${platformLabel} — Information correct at time of display`

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <div
        className="w-full max-w-3xl border border-amber-900/30 rounded-sm overflow-hidden
                   shadow-[0_0_40px_rgba(180,80,0,0.15)] bg-black"
      >
        {/* ── Header bar ── */}
        <div
          className="flex items-center justify-between px-4 py-2
                     border-b border-amber-900/40 bg-black/80"
        >
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-amber-400 text-sm font-bold tracking-widest led-glow uppercase">
              {stationLabel}
            </span>
            <span className="font-mono text-amber-600 text-xs tracking-wider">{platformLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <ClockDisplay />
            <button
              onClick={refetch}
              title="Refresh"
              className="text-zinc-600 hover:text-amber-400 transition-colors p-1"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onOpenSettings}
              title="Settings"
              className="text-zinc-600 hover:text-amber-400 transition-colors p-1"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* ── Main board area ── */}
        <div className="px-4 py-3 space-y-4 min-h-[14rem]">
          {error && (
            <div className="font-mono text-red-500 text-sm tracking-wide">Error: {error}</div>
          )}

          {!error && trains.length === 0 && !loading && (
            <div className="font-mono text-amber-600/60 text-sm tracking-widest pt-4 text-center">
              {config.platform
                ? `No departures from Platform ${config.platform}`
                : "No departures available"}
            </div>
          )}

          {trains[0] && (
            <div className="space-y-2">
              <TrainRow train={trains[0]} variant="primary" now={now} />
              <CallingPoints trains={[trains[0]]} token={config.token} />
            </div>
          )}

          {trains.length > 1 && (
            <div className="border-t border-amber-900/20 pt-3 space-y-1">
              {trains.slice(1).map((t) => (
                <TrainRow key={t.serviceID} train={t} variant="secondary" now={now} />
              ))}
            </div>
          )}
        </div>

        {/* ── Info ticker ── */}
        <InfoTicker messages={nrccMessages} staticMessage={defaultTickerMsg} />
      </div>
    </div>
  )
}
