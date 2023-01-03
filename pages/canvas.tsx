import { ChangeEvent, useEffect, useRef, useState } from 'react'
import ClientOnly from '../components/ClientOnly'
import moment from 'moment'
import useCanvas from '../hooks/useCanvas'

declare global {
  interface Window {
    aptos: any
    martian: any | undefined
  }
}

export default function Canvas() {
  const { canvasRef, handleFileChange, playOrPause, setFormattedTime, videoState, currentTime } =
    useCanvas()

  return (
    <ClientOnly>
      <>
        <h2>Video</h2>
        <form>
          <input type="file" accept="video/*" onChange={handleFileChange} />
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
      </>
    </ClientOnly>
  )
}
