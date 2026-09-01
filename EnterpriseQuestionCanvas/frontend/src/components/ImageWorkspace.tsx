import { useEffect, useRef } from 'react'
export function ImageWorkspace() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
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
      context.clearRect(0, 0, rect.width, rect.height)
    }
    resizeCanvas()
    const observer = new ResizeObserver(resizeCanvas)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])
  return (
    <section className="panel image-panel" aria-labelledby="image-title">
      <div className="panel-heading">
        <div>
          <h2 id="image-title">Answer Image</h2>
          <p>Part 2 will render the generated answer here.</p>
        </div>
        <span className="badge">Part 2</span>
      </div>
      <canvas
        ref={canvasRef}
        className="answer-canvas"
        aria-label="Generated answer image workspace"
      />
      <fieldset className="future-controls" disabled>
        <legend>Image controls - enabled in Part 2</legend>
       <label>
          Sharpen
          <input type="range" min="0" max="100" defaultValue="0" />
        </label>
        <label>
          Noise reduction
          <input type="range" min="0" max="100" defaultValue="0" />
        </label>
        <button type="button">Reset image</button>
      </fieldset>
    </section>
  )
}