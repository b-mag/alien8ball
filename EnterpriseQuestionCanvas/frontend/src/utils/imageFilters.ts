/** Slider values (0–100) that undo randomized image degradation. */
export type CleanupSettings = {
  sharpen: number
  contrast: number
  brightness: number
  noiseReduction: number
  glow: number
}

/** Random baseline distortion applied when a question is viewed. */
export type DistortionProfile = {
  blurAmount: number
  noiseLevel: number
  contrastCrush: number
  brightnessOffset: number
}

/**
 * Creates a randomized degradation profile so slider sweet spots differ each view.
 */
export function createDistortionProfile(): DistortionProfile {
  return {
    blurAmount: 2 + Math.random() * 6,
    noiseLevel: 0.08 + Math.random() * 0.22,
    contrastCrush: 0.35 + Math.random() * 0.35,
    brightnessOffset: -0.12 - Math.random() * 0.18,
  }
}

/**
 * Maps a 0–100 slider value to a 0–1 blend factor.
 */
export function sliderToFactor(value: number): number {
  return Math.max(0, Math.min(1, value / 100))
}

/**
 * Applies degradation and cleanup filters to canvas image data.
 */
export function applyImageFilters(
  imageData: ImageData,
  profile: DistortionProfile,
  settings: CleanupSettings,
): ImageData {
  const { data, width, height } = imageData
  const output = new ImageData(width, height)
  const sharpenFactor = sliderToFactor(settings.sharpen)
  const contrastFactor = sliderToFactor(settings.contrast)
  const brightnessFactor = sliderToFactor(settings.brightness)
  const noiseFactor = sliderToFactor(settings.noiseReduction)
  const glowFactor = sliderToFactor(settings.glow)

  const effectiveBlur = profile.blurAmount * (1 - sharpenFactor)
  const effectiveNoise = profile.noiseLevel * (1 - noiseFactor)
  const effectiveContrastCrush = profile.contrastCrush * (1 - contrastFactor)
  const effectiveBrightness = profile.brightnessOffset * (1 - brightnessFactor)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sample = samplePixel(data, width, height, x, y, effectiveBlur)
      let r = sample[0]
      let g = sample[1]
      let b = sample[2]
      let a = sample[3]

      if (effectiveNoise > 0) {
        const noise = (Math.random() - 0.5) * 255 * effectiveNoise
        r += noise
        g += noise
        b += noise
      }

      const crush = 1 - effectiveContrastCrush
      r = ((r / 255 - 0.5) * crush + 0.5) * 255
      g = ((g / 255 - 0.5) * crush + 0.5) * 255
      b = ((b / 255 - 0.5) * crush + 0.5) * 255

      r += effectiveBrightness * 255
      g += effectiveBrightness * 255
      b += effectiveBrightness * 255

      if (glowFactor > 0 && g > 40) {
        const boost = 1 + glowFactor * 0.8
        g = Math.min(255, g * boost)
        r = Math.min(255, r * (1 + glowFactor * 0.15))
      }

      const idx = (y * width + x) * 4
      output.data[idx] = clamp(r)
      output.data[idx + 1] = clamp(g)
      output.data[idx + 2] = clamp(b)
      output.data[idx + 3] = a
    }
  }

  return output
}

function samplePixel(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  blurRadius: number,
): [number, number, number, number] {
  if (blurRadius <= 0.5) {
    const idx = (y * width + x) * 4
    return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
  }

  const radius = Math.ceil(blurRadius)
  let r = 0
  let g = 0
  let b = 0
  let a = 0
  let count = 0

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const sx = Math.min(width - 1, Math.max(0, x + dx))
      const sy = Math.min(height - 1, Math.max(0, y + dy))
      const idx = (sy * width + sx) * 4
      r += data[idx]
      g += data[idx + 1]
      b += data[idx + 2]
      a += data[idx + 3]
      count++
    }
  }

  return [r / count, g / count, b / count, a / count]
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}
