import { Settings, RefreshCw, Maximize2, Minimize2 } from "lucide-react"
import { ClockDisplay } from "./ClockDisplay"
import { TrainRow } from "./TrainRow"
import { CallingPoints } from "./CallingPoints"
import { SecondaryTrains } from "./SecondaryTrains"
import type { DisplayConfig } from "@/lib/types"
import { useDepartures } from "@/hooks/useDepartures"
import { useTime } from "@/hooks/useTime"
import { hasDeparted } from "@/lib/utils"
import { useState, useEffect } from "react"

interface PlatformDisplayProps {
  config: DisplayConfig
  onOpenSettings: () => void
}

/** Blank row that holds the same height as a TrainRow */
function EmptyRow() {
  return <div className="h-7" />
}

/** Blank row that holds the same height as the CallingPoints row */
function EmptyCallingPoints() {
  return <div className="h-7" />
}

export function PlatformDisplay({ config, onOpenSettings }: PlatformDisplayProps) {
  const now = useTime()
  const {
    boardInfo,
    trains: rawTrains,
    loading,
    error,
    refetch,
  } = useDepartures(config.stationCrs, config.token, config.platform, true)

  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  // Remove any trains that have already departed
  const trains = rawTrains.filter((t) => !hasDeparted(t, now))

  const stationLabel = boardInfo?.locationName ?? config.stationName
  const platformLabel = config.platform ? `Platform ${config.platform}` : "All Platforms"

  const primaryTrain = trains[0]
  const secondaryTrains = trains.slice(1)

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <div
        className="w-full max-w-3xl border border-amber-900/30 rounded-sm overflow-hidden
                   shadow-[0_0_40px_rgba(180,80,0,0.15)] bg-black"
        style={{ transform: "scale(1.25)", transformOrigin: "center center" }}
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
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="text-zinc-600 hover:text-amber-400 transition-colors p-1"
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
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

        {/* ── Error banner ── */}
        {error && (
          <div className="px-4 py-1.5 bg-red-950/60 border-b border-red-800/50 font-mono text-red-400 text-xs">
            API error: {error}
          </div>
        )}

        {/* ── Main board area — always 3 rows ── */}
        <div className="px-4 pt-4 pb-3 space-y-3">
          {trains.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-28">
              <span className="font-mono text-amber-400 text-4xl led-glow tracking-widest">
                No Services
              </span>
            </div>
          ) : (
            <>
              {/* Row 1: first train */}
              {primaryTrain ? <TrainRow train={primaryTrain} now={now} /> : <EmptyRow />}

              {/* Row 2: calling points */}
              {primaryTrain ? (
                <CallingPoints trains={[primaryTrain]} token={config.token} />
              ) : (
                <EmptyCallingPoints />
              )}

              {/* Row 3: secondary train(s) */}
              {secondaryTrains.length > 0 ? (
                <SecondaryTrains trains={secondaryTrains} now={now} />
              ) : (
                <EmptyRow />
              )}
            </>
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
