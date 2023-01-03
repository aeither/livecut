import { ChangeEvent, useEffect, useRef, useState } from 'react'
import moment from 'moment'

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

export default function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [videoState, setVideoState] = useState<VideoState>({
    file: null,
    url: null,
    video: null,
  })
  const [currentTime, setCurrentTime] = useState('00:00:00')

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0]
    if (file === null) throw new Error('No file')
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.src = url
    video.muted = true
    video.loop = true
    video.play()
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

    requestAnimationFrame(() => draw(context))
  }

  const playOrPause = () => {
    if (!videoState.video) return
    console.log('toggling.. play pause')
    videoState.video.paused ? videoState.video.play() : videoState.video.pause()
  }

  const setFormattedTime = (value: string) => {
    if (videoState.video) {
      videoState.video.currentTime = Number(value)

      const _currentTime = moment()
        .startOf('day')
        .seconds(videoState.video?.currentTime)
        .format('H:mm:ss')

      setCurrentTime(_currentTime)
    }
  }

  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return
    const context = canvasRef.current.getContext('2d')

    if (context) {
      draw(context)
    }
  }, [canvasRef, canvasRef.current])

  return {
    handleFileChange,
    playOrPause,
    setFormattedTime,
    canvasRef,
    videoState,
    currentTime,
  }
}
