import { ChangeEvent, useEffect, useRef, useState } from 'react'
import ClientOnly from '../components/ClientOnly'

declare global {
  interface Window {
    aptos: any
    martian: any | undefined
  }
}

type VideoState = {
  file: File | null
  url: string | null
  video: HTMLVideoElement | null
}

export default function Chat() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [videoState, setVideoState] = useState<VideoState>({
    file: null,
    url: null,
    video: null,
  })

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // get file
    const file = event.target.files && event.target.files[0]
    if (file === null) throw new Error('No file')

    // create url
    const url = URL.createObjectURL(file)

    // create video element
    const video = document.createElement('video')

    // set attributes
    video.src = url
    // video.autoplay = true
    video.muted = true
    video.loop = true

    // play video
    video.play()

    // update state
    setVideoState({ file, url, video })
  }

  function draw(context: CanvasRenderingContext2D) {
    if (!canvasRef || !canvasRef.current) return

    context.drawImage(
      videoState.video as any,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    )

    // console.log(
    //   videoState.video.duration,
    //   videoState.video?.currentTime,
    //   videoState.video?.paused
    //   videoState.video.getAnimations(),
    //   videoState.video.volume
    // )
    requestAnimationFrame(() => draw(context))
  }

  //   function seekToFrame(video: HTMLVideoElement, frameNumber: number, fps = 25) {
  //     // calculate time to seek to, in seconds
  //     var seekTime = Math.round((frameNumber / fps) * 1000) / 1000
  //     // set video currentTime
  //     video.currentTime = seekTime
  //   }

  const playOrPause = () => {
    if (!videoState.video) return
    console.log('toggling.. play pause')
    videoState.video.paused ? videoState.video.play() : videoState.video.pause()
  }

  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return

    const context = canvasRef.current.getContext('2d')

    if (context) {
      // draw video frame to canvas
      draw(context)
    }
  }, [canvasRef, canvasRef.current])

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
          onChange={e => {
            if (videoState.video) {
              console.log(e.target.value)
              videoState.video.currentTime = Number(e.target.value)
            }
          }}
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
      </>
    </ClientOnly>
  )
}
