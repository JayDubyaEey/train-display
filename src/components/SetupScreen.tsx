import { useState } from "react"
import { StationSearch } from "./StationSearch"
import type { DisplayConfig, CrsResult } from "@/lib/types"
import { useAvailablePlatforms } from "@/hooks/useAvailablePlatforms"

interface SetupScreenProps {
  onSave: (config: DisplayConfig) => void
  initial?: Partial<DisplayConfig>
}

export function SetupScreen({ onSave, initial = {} }: SetupScreenProps) {
  const [token, setToken] = useState(initial.token ?? "")
  const [tokenSaved, setTokenSaved] = useState(!!initial.token)
  const [station, setStation] = useState<CrsResult | null>(
    initial.stationCrs
      ? { stationName: initial.stationName ?? "", crsCode: initial.stationCrs }
      : null
  )
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    (initial.platforms ?? []).filter((p) => p !== "")
  )
  const [error, setError] = useState<string | null>(null)

  const activeToken = tokenSaved ? (initial.token ?? token) : token
  const { platforms: availablePlatforms, loading: platformsLoading } = useAvailablePlatforms(
    station?.crsCode ?? "",
    activeToken,
    !!(station && activeToken)
  )

  function togglePlatform(p: string) {
    setSelectedPlatforms((prev) => {
      if (prev.includes(p)) {
        if (prev.length === 1) return prev // always keep at least 1
        return prev.filter((x) => x !== p)
      }
      if (prev.length >= 4) return prev
      return [...prev, p]
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token.trim() && !tokenSaved) {
      setError("Please enter your NRE access token.")
      return
    }
    if (!station) {
      setError("Please select a station.")
      return
    }
    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform.")
      return
    }
    setError(null)
    onSave({
      token: activeToken.trim(),
      stationCrs: station.crsCode,
      stationName: station.stationName,
      platforms: selectedPlatforms,
    })
  }

  const hasStation = !!(station && activeToken)

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
            {tokenSaved ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-400 text-sm font-mono tracking-widest">
                  ••••••••••••••••
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setToken("")
                    setTokenSaved(false)
                  }}
                  className="text-xs font-mono text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 rounded px-2 py-2 transition-colors whitespace-nowrap"
                >
                  Clear
                </button>
              </div>
            ) : (
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Your Darwin API token (GUID)"
                className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-amber-100
                           placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm font-mono"
                autoComplete="off"
              />
            )}
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
            {tokenSaved || token.trim() ? (
              <StationSearch
                token={activeToken}
                value={station}
                onChange={(s) => {
                  setStation(s)
                  // Reset platform selection — platforms are station-specific
                  setSelectedPlatforms([])
                }}
              />
            ) : (
              <div className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-600 text-sm font-mono">
                Enter your token first
              </div>
            )}
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
              Platforms
              <span className="text-zinc-600 normal-case ml-2">(select up to 4)</span>
            </label>
            {!hasStation ? (
              <div className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-600 text-sm font-mono">
                Select a station first
              </div>
            ) : platformsLoading ? (
              <div className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-500 text-sm font-mono">
                Loading platforms…
              </div>
            ) : availablePlatforms.length === 0 ? (
              <div className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-500 text-sm font-mono">
                No platform data available
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-700 rounded p-2 flex flex-wrap gap-2">
                {availablePlatforms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    disabled={!selectedPlatforms.includes(p) && selectedPlatforms.length >= 4}
                    className={`px-3 py-1 rounded font-mono text-xs font-bold tracking-wider transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed
                      ${
                        selectedPlatforms.includes(p)
                          ? "bg-amber-500 text-black"
                          : "bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-600"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
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
