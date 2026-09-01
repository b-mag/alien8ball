import { useEffect, useRef } from 'react'
import { useAnswerImage } from '../hooks/useAnswerImage'
import { useImageCleanup } from '../hooks/useImageCleanup'

type DecryptConsoleProps = {
  projectId: string | null
  questionId: string | null
  questionText: string | null
  onReturn: () => void
}

/**
 * Decryption console with a stargate viewport, alien answer canvas, and cleanup controls.
 */
export function DecryptConsole({
  projectId,
  questionId,
  questionText,
  onReturn,
}: DecryptConsoleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const { imageUrl, loading, error } = useAnswerImage(projectId, questionId)
  const {
    settings,
    profile,
    updateSetting,
    randomizeDistortion,
    renderToCanvas,
    resetSettings,
  } = useImageCleanup()

  useEffect(() => {
    randomizeDistortion()
  }, [questionId, randomizeDistortion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      const context = canvas.getContext('2d')
      if (!context) return
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (imageRef.current?.complete) {
        renderToCanvas(canvas, imageRef.current)
      }
    }

    resizeCanvas()
    const observer = new ResizeObserver(resizeCanvas)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [renderToCanvas])

  useEffect(() => {
    if (!imageUrl) return

    const image = new Image()
    imageRef.current = image
    image.onload = () => {
      const canvas = canvasRef.current
      if (canvas) {
        renderToCanvas(canvas, image)
      }
    }
    image.src = imageUrl

    return () => {
      image.onload = null
    }
  }, [imageUrl, renderToCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (canvas && image?.complete) {
      renderToCanvas(canvas, image)
    }
  }, [settings, profile, renderToCanvas])

  return (
    <div className="decrypt-console">
      <section className="panel decrypt-panel" aria-labelledby="decrypt-title">
        <div className="panel-heading">
          <div>
            <h2 id="decrypt-title">SIGNAL DECRYPTION</h2>
            <p>Calibrate the viewport to decode the alien response.</p>
          </div>
          <button type="button" className="secondary" onClick={onReturn}>
            ← RETURN TO TRANSMISSION
          </button>
        </div>

        {questionText && (
          <p className="transmitted-question">
            <span className="label">Source signal:</span> {questionText}
          </p>
        )}

        <div className="stargate-frame" aria-label="Stargate decryption viewport">
          <div className="stargate-ring">
            <svg className="stargate-runes" viewBox="0 0 200 200" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, index) => {
                const angle = (index / 12) * Math.PI * 2
                const x = 100 + Math.cos(angle) * 88
                const y = 100 + Math.sin(angle) * 88
                return (
                  <text
                    key={index}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="rune"
                  >
                    {String.fromCharCode(0x25C6 + (index % 6))}
                  </text>
                )
              })}
            </svg>
            <div className="stargate-viewport">
              {loading && <p className="viewport-status">Receiving signal...</p>}
              {error && <p className="viewport-status error" role="alert">{error}</p>}
              {!loading && !error && !questionId && (
                <p className="viewport-status">No transmission selected.</p>
              )}
              <canvas
                ref={canvasRef}
                className="answer-canvas"
                aria-label="Decoded alien writing"
              />
            </div>
          </div>
        </div>

        <fieldset className="cleanup-controls">
          <legend>Signal Cleanup</legend>
          <label>
            Deblur / Sharpen
            <input
              type="range"
              min="0"
              max="100"
              value={settings.sharpen}
              onChange={(event) =>
                updateSetting('sharpen', Number(event.target.value))}
            />
          </label>
          <label>
            Contrast
            <input
              type="range"
              min="0"
              max="100"
              value={settings.contrast}
              onChange={(event) =>
                updateSetting('contrast', Number(event.target.value))}
            />
          </label>
          <label>
            Brightness
            <input
              type="range"
              min="0"
              max="100"
              value={settings.brightness}
              onChange={(event) =>
                updateSetting('brightness', Number(event.target.value))}
            />
          </label>
          <label>
            Noise Reduction
            <input
              type="range"
              min="0"
              max="100"
              value={settings.noiseReduction}
              onChange={(event) =>
                updateSetting('noiseReduction', Number(event.target.value))}
            />
          </label>
          <label>
            Glow Intensity
            <input
              type="range"
              min="0"
              max="100"
              value={settings.glow}
              onChange={(event) =>
                updateSetting('glow', Number(event.target.value))}
            />
          </label>
          <div className="control-actions">
            <button type="button" className="secondary" onClick={resetSettings}>
              Reset Sliders
            </button>
            <button type="button" onClick={randomizeDistortion}>
              Recalibrate
            </button>
          </div>
        </fieldset>
      </section>
    </div>
  )
}
