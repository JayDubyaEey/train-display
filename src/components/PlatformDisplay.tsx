import { Settings, Maximize2, Minimize2, Plus, X } from "lucide-react"
import { BoardPanel } from "./BoardPanel"
import type { DisplayConfig } from "@/lib/types"
import { useAvailablePlatforms } from "@/hooks/useAvailablePlatforms"
import { useState, useEffect } from "react"

interface PlatformDisplayProps {
  config: DisplayConfig
  onOpenSettings: () => void
  onUpdatePlatforms: (platforms: string[]) => void
}

export function PlatformDisplay({
  config,
  onOpenSettings,
  onUpdatePlatforms,
}: PlatformDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const stationLabel = config.stationName
  const { platforms: availablePlatforms } = useAvailablePlatforms(
    config.stationCrs,
    config.token,
    true
  )

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

  function togglePlatform(p: string) {
    const current = config.platforms
    if (current.includes(p)) {
      if (current.length === 1) return
      onUpdatePlatforms(current.filter((x) => x !== p))
    } else {
      if (current.length >= 4) return
      onUpdatePlatforms([...current, p])
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-amber-900/30 relative">
        <div className="flex items-center gap-4">
          <span className="font-mono text-amber-400 text-sm font-bold tracking-widest led-glow uppercase">
            {stationLabel}
          </span>

          {/* Platform pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {config.platforms.map((p) => (
              <span
                key={p}
                className="flex items-center gap-1 bg-zinc-800 border border-amber-900/50 rounded px-2 py-0.5 font-mono text-amber-400 text-xs"
              >
                {`Plat ${p}`}
                <button
                  onClick={() => togglePlatform(p)}
                  disabled={config.platforms.length === 1}
                  className="text-zinc-500 hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed ml-0.5"
                  title="Remove"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {/* Add platform button */}
            {config.platforms.length < 4 && (
              <button
                onClick={() => setPickerOpen((o) => !o)}
                className="flex items-center gap-0.5 bg-zinc-800 border border-zinc-600 hover:border-amber-600 rounded px-2 py-0.5 font-mono text-zinc-500 hover:text-amber-400 text-xs transition-colors"
                title="Add platform"
              >
                <Plus size={10} /> Add
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
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

        {/* Platform picker dropdown */}
        {pickerOpen && (
          <div className="absolute top-full left-6 mt-1 z-50 bg-zinc-900 border border-amber-900/40 rounded shadow-lg p-3 flex flex-wrap gap-2 max-w-xs">
            {availablePlatforms.map((p) => (
              <button
                key={p}
                onClick={() => {
                  togglePlatform(p)
                  setPickerOpen(false)
                }}
                disabled={config.platforms.includes(p)}
                className={`px-3 py-1 rounded font-mono text-xs font-bold tracking-wider transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${
                    config.platforms.includes(p)
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

      {/* Board stack */}
      <div className="flex-1 flex flex-col justify-center items-center gap-16 py-10 px-4 overflow-y-auto">
        {config.platforms.map((platform) => (
          <div
            key={platform}
            className="w-full max-w-3xl"
            style={{ transform: "scale(1.1)", transformOrigin: "top center", marginBottom: "1rem" }}
          >
            <BoardPanel config={config} platform={platform} stationLabel={stationLabel} />
          </div>
        ))}
      </div>
    </div>
  )
}
