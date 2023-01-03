import ClientOnly from '../components/ClientOnly'
import useCanvas from '../hooks/useCanvas'

declare global {
  interface Window {
    aptos: any
    martian: any | undefined
  }
}

export default function Canvas() {
  const {
    ctx,
    canvasRef,
    handleFileChange,
    playOrPause,
    setFormattedTime,
    videoState,
    currentTime,
  } = useCanvas()

  const drawText = () => {
    if (!ctx || !canvasRef.current) return

    console.log('drawing...')
    ctx.font = '30px Arial'
    ctx.fillStyle = 'red'
    ctx.textAlign = 'center'
    ctx.fillText('Hello World', canvasRef.current.width / 2, canvasRef.current.height / 2)
  }

  return (
    <ClientOnly>
      <>
        <h2>Video</h2>
        <form>
          <input
            type="file"
            accept="video/*"
            onChange={event => {
              const file = event.target.files && event.target.files[0]
              if (file) handleFileChange(file)
            }}
          />
        </form>
        <div style={{ borderWidth: '2px' }}>
          <canvas ref={canvasRef} width="640" height="480"></canvas>
        </div>
        <input
          type="range"
          step={0.05}
          max={videoState.video?.duration}
          onChange={e => setFormattedTime(e.target.value)}
        />
        <button
          onClick={() => {
            if (videoState.video) videoState.video.currentTime = 2
          }}
        >
          jump to frame
        </button>
        <button
          onClick={() => {
            playOrPause()
          }}
        >
          Play / Pause
        </button>
        <p>{currentTime}</p>
        <button onClick={drawText}>drawText</button>
      </>
    </ClientOnly>
  )
}
