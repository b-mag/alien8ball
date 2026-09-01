import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useImageCleanup } from './useImageCleanup'

describe('useImageCleanup', () => {
  it('randomizeDistortion resets sliders and changes profile', () => {
    const { result } = renderHook(() => useImageCleanup())
    const firstProfile = result.current.profile

    act(() => {
      result.current.updateSetting('sharpen', 80)
      result.current.randomizeDistortion()
    })

    expect(result.current.settings.sharpen).toBe(0)
    expect(result.current.profile).not.toEqual(firstProfile)
  })

  it('updateSetting changes individual slider values', () => {
    const { result } = renderHook(() => useImageCleanup())

    act(() => {
      result.current.updateSetting('contrast', 42)
    })

    expect(result.current.settings.contrast).toBe(42)
  })
})
