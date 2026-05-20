import { useState, useRef, useEffect } from "react"
import { useStationSearch } from "@/hooks/useStationSearch"
import type { CrsResult } from "@/lib/types"

interface StationSearchProps {
  token: string
  value: CrsResult | null
  onChange: (station: CrsResult) => void
}

export function StationSearch({ token, value, onChange }: StationSearchProps) {
  const [query, setQuery] = useState(value?.stationName ?? "")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { results, loading, search } = useStationSearch(token)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function handleInput(val: string) {
    setQuery(val)
    setOpen(true)
    search(val)
  }

  function handleSelect(station: CrsResult) {
    setQuery(station.stationName)
    setOpen(false)
    onChange(station)
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => query && setOpen(true)}
        placeholder="e.g. London Waterloo"
        className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-amber-100
                   placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm font-mono"
        autoComplete="off"
        spellCheck={false}
      />
      {open && (results.length > 0 || loading) && (
        <ul
          className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-600 rounded
                       shadow-xl max-h-60 overflow-y-auto"
        >
          {loading && <li className="px-3 py-2 text-zinc-400 text-sm font-mono">Searching...</li>}
          {results.map((r) => (
            <li
              key={r.crsCode}
              onMouseDown={() => handleSelect(r)}
              className="px-3 py-2 text-sm font-mono text-amber-100 hover:bg-zinc-700 cursor-pointer
                         flex justify-between"
            >
              <span>{r.stationName}</span>
              <span className="text-zinc-400 text-xs ml-4 self-center">{r.crsCode}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
