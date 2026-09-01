import { describe, expect, it } from 'vitest'
import {
  applyImageFilters,
  createDistortionProfile,
  sliderToFactor,
} from '../utils/imageFilters'

describe('imageFilters', () => {
  it('sliderToFactor clamps values between 0 and 1', () => {
    expect(sliderToFactor(0)).toBe(0)
    expect(sliderToFactor(50)).toBe(0.5)
    expect(sliderToFactor(100)).toBe(1)
    expect(sliderToFactor(150)).toBe(1)
    expect(sliderToFactor(-10)).toBe(0)
  })

  it('createDistortionProfile returns values within expected ranges', () => {
    const profile = createDistortionProfile()
    expect(profile.blurAmount).toBeGreaterThanOrEqual(2)
    expect(profile.noiseLevel).toBeGreaterThan(0)
    expect(profile.contrastCrush).toBeGreaterThan(0)
    expect(profile.brightnessOffset).toBeLessThan(0)
  })

  it('applyImageFilters returns image data of the same dimensions', () => {
    const imageData = new ImageData(4, 4)
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0
      imageData.data[i + 1] = 200
      imageData.data[i + 2] = 20
      imageData.data[i + 3] = 255
    }

    const result = applyImageFilters(
      imageData,
      createDistortionProfile(),
      {
        sharpen: 100,
        contrast: 100,
        brightness: 100,
        noiseReduction: 100,
        glow: 50,
      },
    )

    expect(result.width).toBe(4)
    expect(result.height).toBe(4)
    expect(result.data.some((value) => value > 0)).toBe(true)
  })
})
