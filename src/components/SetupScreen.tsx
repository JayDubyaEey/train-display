import { useState } from "react"
import { StationSearch } from "./StationSearch"
import type { DisplayConfig, CrsResult } from "@/lib/types"

interface SetupScreenProps {
  onSave: (config: DisplayConfig) => void
  initial?: Partial<DisplayConfig>
}

export function SetupScreen({ onSave, initial = {} }: SetupScreenProps) {
  const [token, setToken] = useState(initial.token ?? "")
  const [station, setStation] = useState<CrsResult | null>(
    initial.stationCrs
      ? { stationName: initial.stationName ?? "", crsCode: initial.stationCrs }
      : null
  )
  const [platform, setPlatform] = useState(initial.platform ?? "")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token.trim()) {
      setError("Please enter your NRE access token.")
      return
    }
    if (!station) {
      setError("Please select a station.")
      return
    }
    setError(null)
    onSave({
      token: token.trim(),
      stationCrs: station.crsCode,
      stationName: station.stationName,
      platform: platform.trim(),
    })
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-amber-400 font-mono text-2xl font-bold tracking-widest mb-1 led-glow">
            PLATFORM DISPLAY
          </div>
          <div className="text-zinc-500 font-mono text-xs tracking-wider uppercase">
            UK Train Departure Board Emulator
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* API Token */}
          <div>
            <label className="block text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
              NRE Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Your Darwin API token (GUID)"
              className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-amber-100
                         placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm font-mono"
              autoComplete="off"
            />
            <p className="mt-1 text-zinc-500 text-xs font-mono">
              Register free at{" "}
              <a
                href="https://realtime.nationalrail.co.uk/OpenLDBWSRegistration/Registration"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 underline"
              >
                nationalrail.co.uk
              </a>
            </p>
          </div>

          {/* Station */}
          <div>
            <label className="block text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
              Station
            </label>
            {token.trim() ? (
              <StationSearch token={token} value={station} onChange={setStation} />
            ) : (
              <div
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2
                              text-zinc-600 text-sm font-mono"
              >
                Enter your token first
              </div>
            )}
          </div>

          {/* Platform */}
          <div>
            <label className="block text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
              Platform{" "}
              <span className="text-zinc-600 normal-case">(optional — leave blank for all)</span>
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g. 1, 2A, 12"
              className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-amber-100
                         placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm font-mono
                         uppercase"
            />
          </div>

          {error && <p className="text-red-400 font-mono text-xs">{error}</p>}

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold
                       py-2.5 rounded tracking-widest text-sm transition-colors"
          >
            START DISPLAY
          </button>
        </form>
      </div>
    </div>
  )
}
