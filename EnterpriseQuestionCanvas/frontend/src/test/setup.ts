import '@testing-library/jest-dom/vitest'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
})

if (typeof ImageData === 'undefined') {
  class ImageDataPolyfill {
    readonly data: Uint8ClampedArray
    readonly width: number
    readonly height: number

    constructor(width: number, height: number)
    constructor(data: Uint8ClampedArray, width: number, height?: number)
    constructor(
      arg1: number | Uint8ClampedArray,
      arg2: number,
      arg3?: number,
    ) {
      if (typeof arg1 === 'number') {
        this.width = arg1
        this.height = arg2
        this.data = new Uint8ClampedArray(arg1 * arg2 * 4)
      } else {
        this.data = arg1
        this.width = arg2
        this.height = arg3 ?? Math.floor(arg1.length / (4 * arg2))
      }
    }
  }

  Object.defineProperty(globalThis, 'ImageData', {
    writable: true,
    configurable: true,
    value: ImageDataPolyfill,
  })
}
