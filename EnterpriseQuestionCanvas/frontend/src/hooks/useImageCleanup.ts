import { useCallback, useMemo, useState } from 'react'
import {
  applyImageFilters,
  createDistortionProfile,
  type CleanupSettings,
  type DistortionProfile,
} from '../utils/imageFilters'

const defaultSettings: CleanupSettings = {
  sharpen: 0,
  contrast: 0,
  brightness: 0,
  noiseReduction: 0,
  glow: 0,
}

/**
 * Manages randomized image degradation and cleanup slider state for the decrypt console.
 */
export function useImageCleanup() {
  const [settings, setSettings] = useState<CleanupSettings>(defaultSettings)
  const [profile, setProfile] = useState<DistortionProfile>(() => createDistortionProfile())

  /**
   * Re-randomizes the distortion profile and resets sliders to zero.
   */
  const randomizeDistortion = useCallback(() => {
    setProfile(createDistortionProfile())
    setSettings(defaultSettings)
  }, [])

  /**
   * Updates a single cleanup slider value.
   */
  const updateSetting = useCallback(
    (key: keyof CleanupSettings, value: number) => {
      setSettings((current) => ({ ...current, [key]: value }))
    },
    [],
  )

  /**
   * Renders the source image onto the canvas with degradation and cleanup applied.
   */
  const renderToCanvas = useCallback(
    (canvas: HTMLCanvasElement, source: CanvasImageSource) => {
      const context = canvas.getContext('2d')
      if (!context) return

      const width = canvas.width
      const height = canvas.height
      context.clearRect(0, 0, width, height)
      context.drawImage(source, 0, 0, width, height)

      const imageData = context.getImageData(0, 0, width, height)
      const filtered = applyImageFilters(imageData, profile, settings)
      context.putImageData(filtered, 0, 0)
    },
    [profile, settings],
  )

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
  }, [])

  return useMemo(
    () => ({
      settings,
      profile,
      updateSetting,
      randomizeDistortion,
      renderToCanvas,
      resetSettings,
    }),
    [settings, profile, updateSetting, randomizeDistortion, renderToCanvas, resetSettings],
  )
}
