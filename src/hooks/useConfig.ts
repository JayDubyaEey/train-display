import { useState, useCallback } from "react"
import { STORAGE_KEYS } from "@/lib/constants"
import type { DisplayConfig } from "@/lib/types"

function readConfig(): Partial<DisplayConfig> {
  const platformsRaw = localStorage.getItem(STORAGE_KEYS.platforms)
  const legacyPlatform = localStorage.getItem("train-display:platform")
  const platforms: string[] = platformsRaw
    ? (JSON.parse(platformsRaw) as string[]).filter((p) => p !== "")
    : legacyPlatform
      ? [legacyPlatform].filter(Boolean)
      : []
  return {
    token: localStorage.getItem(STORAGE_KEYS.token) ?? "",
    stationCrs: localStorage.getItem(STORAGE_KEYS.stationCrs) ?? "",
    stationName: localStorage.getItem(STORAGE_KEYS.stationName) ?? "",
    platforms,
  }
}

export function useConfig() {
  const [config, setConfigState] = useState<Partial<DisplayConfig>>(readConfig)

  const isConfigured = !!config.token && !!config.stationCrs && !!config.platforms?.length

  const saveConfig = useCallback((next: DisplayConfig) => {
    const platforms = next.platforms.filter((p) => p !== "")
    localStorage.setItem(STORAGE_KEYS.token, next.token)
    localStorage.setItem(STORAGE_KEYS.stationCrs, next.stationCrs)
    localStorage.setItem(STORAGE_KEYS.stationName, next.stationName)
    localStorage.setItem(STORAGE_KEYS.platforms, JSON.stringify(platforms))
    setConfigState({ ...next, platforms })
  }, [])

  const clearConfig = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
    setConfigState({})
  }, [])

  return { config, isConfigured, saveConfig, clearConfig }
}
