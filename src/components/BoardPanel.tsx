import { useState, useEffect } from "react"
import { ClockDisplay } from "./ClockDisplay"
import { TrainRow } from "./TrainRow"
import { CallingPoints } from "./CallingPoints"
import { SecondaryTrains } from "./SecondaryTrains"
import { NrccMessage } from "./NrccMessage"
import type { DisplayConfig } from "@/lib/types"
import { useDepartures } from "@/hooks/useDepartures"
import { useTime } from "@/hooks/useTime"
import { hasDeparted, stripHtml } from "@/lib/utils"

const NRCC_INTERVAL_MS = 2 * 60 * 1000

interface BoardPanelProps {
  config: DisplayConfig
  platform: string
  stationLabel: string
}

function EmptySlot() {
  return <div className="h-7" />
}

export function BoardPanel({ config, platform, stationLabel }: BoardPanelProps) {
  const now = useTime()
  const {
    boardInfo,
    trains: rawTrains,
    loading,
    error,
  } = useDepartures(config.stationCrs, config.token, platform, true)

  const [showNrcc, setShowNrcc] = useState(false)
  const [nrccIndex, setNrccIndex] = useState(0)

  const nrccMessages = (boardInfo?.nrccMessages ?? [])
    .map((m) => stripHtml(m.value))
    .filter(Boolean)

  useEffect(() => {
    if (nrccMessages.length === 0) return
    const id = setInterval(() => {
      setNrccIndex(Math.floor(Math.random() * nrccMessages.length))
      setShowNrcc(true)
    }, NRCC_INTERVAL_MS)
    return () => clearInterval(id)
  }, [nrccMessages.length])

  const trains = rawTrains.filter((t) => !hasDeparted(t, now))
  const platformLabel = platform ? `Platform ${platform}` : "All Platforms"
  const primaryTrain = trains[0]
  const secondaryTrains = trains.slice(1)

  return (
    <div className="border border-amber-900/30 rounded-sm overflow-hidden shadow-[0_0_40px_rgba(180,80,0,0.15)] bg-black w-full">
      {/* Platform header */}
      <div className="flex items-center px-4 py-2 border-b border-amber-900/40">
        <span className="font-mono font-bold text-amber-400 text-xs tracking-wider">
          {platformLabel}
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-1.5 border-b border-amber-900/30 font-mono text-amber-400 text-xs">
          {error}
        </div>
      )}

      {/* Main board area */}
      <div className="px-4 pt-4 pb-3 space-y-3">
        {trains.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-28">
            <span className="font-mono font-bold text-amber-400 text-4xl led-glow tracking-widest">
              No Services
            </span>
          </div>
        ) : (
          <>
            {primaryTrain ? <TrainRow train={primaryTrain} now={now} /> : <EmptySlot />}

            {primaryTrain ? (
              <CallingPoints
                trains={[primaryTrain]}
                token={config.token}
                stationName={stationLabel}
              />
            ) : (
              <EmptySlot />
            )}

            {showNrcc && nrccMessages[nrccIndex] ? (
              <NrccMessage
                message={nrccMessages[nrccIndex]}
                onScrollEnd={() => setShowNrcc(false)}
              />
            ) : secondaryTrains.length > 0 ? (
              <SecondaryTrains trains={secondaryTrains} now={now} />
            ) : (
              <EmptySlot />
            )}
          </>
        )}
      </div>

      {/* Clock */}
      <div className="py-3 text-center border-t border-amber-900/20">
        <ClockDisplay />
      </div>
    </div>
  )
}
