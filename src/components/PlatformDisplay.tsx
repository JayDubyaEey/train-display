import { Settings, RefreshCw } from "lucide-react"
import { ClockDisplay } from "./ClockDisplay"
import { TrainRow } from "./TrainRow"
import { CallingPoints } from "./CallingPoints"
import type { DisplayConfig } from "@/lib/types"
import { useDepartures } from "@/hooks/useDepartures"
import { useTime } from "@/hooks/useTime"

interface PlatformDisplayProps {
  config: DisplayConfig
  onOpenSettings: () => void
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

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <div
        className="w-full max-w-3xl border border-amber-900/30 rounded-sm overflow-hidden
                   shadow-[0_0_40px_rgba(180,80,0,0.15)] bg-black"
      >
        {/* ── Header bar ── */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-amber-900/40">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-amber-400 text-sm font-bold tracking-widest led-glow uppercase">
              {stationLabel}
            </span>
            <span className="font-mono text-amber-600 text-xs tracking-wider">{platformLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              title="Refresh"
              className="text-zinc-600 hover:text-amber-400 transition-colors p-1"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onOpenSettings}
              title="Settings"
              className="text-zinc-600 hover:text-amber-400 transition-colors p-1"
            >
              <Settings size={13} />
            </button>
          </div>
        </div>

        {/* ── Main board area ── */}
        <div className="px-4 pt-4 pb-3 space-y-3">
          {error && (
            <div className="font-mono text-red-500 text-sm tracking-wide">Error: {error}</div>
          )}

          {!error && trains.length === 0 && !loading && (
            <div className="font-mono text-amber-600/60 text-sm tracking-widest py-6 text-center">
              {config.platform
                ? `No departures from Platform ${config.platform}`
                : "No departures available"}
            </div>
          )}

          {/* First train + calling points */}
          {trains[0] && (
            <div>
              <TrainRow train={trains[0]} variant="primary" now={now} />
              <div className="mt-1.5">
                <CallingPoints trains={[trains[0]]} token={config.token} />
              </div>
            </div>
          )}

          {/* Second train */}
          {trains[1] && (
            <div className="pt-1">
              <TrainRow train={trains[1]} variant="secondary" now={now} />
            </div>
          )}
        </div>

        {/* ── Clock ── */}
        <div className="py-3 text-center border-t border-amber-900/20">
          <ClockDisplay />
        </div>
      </div>
    </div>
  )
}
