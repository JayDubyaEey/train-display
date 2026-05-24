import { useState } from "react"
import { useConfig } from "@/hooks/useConfig"
import { SetupScreen } from "@/components/SetupScreen"
import { PlatformDisplay } from "@/components/PlatformDisplay"
import type { DisplayConfig } from "@/lib/types"

export default function App() {
  const { config, isConfigured, saveConfig } = useConfig()
  const [showSettings, setShowSettings] = useState(false)

  if (!isConfigured || showSettings) {
    return (
      <SetupScreen
        initial={config}
        onSave={(next: DisplayConfig) => {
          saveConfig(next)
          setShowSettings(false)
        }}
      />
    )
  }

  return (
    <PlatformDisplay
      config={config as DisplayConfig}
      onOpenSettings={() => {
        setShowSettings(true)
      }}
    />
  )
}
