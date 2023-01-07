import moment from 'moment'
import { useEffect, useRef, useState } from 'react'

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
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>()
  const [videoState, setVideoState] = useState<VideoState>({
    file: null,
    url: null,
    video: null,
  })
  const [currentTime, setCurrentTime] = useState('00:00:00')
  const [cutStartTime, setCutStartTime] = useState<string>('00:00:00')
  const [cutEndTime, setCutEndTime] = useState<string>('00:00:00')

  const handleFileChange = (file: File) => {
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
    if (!canvasRef || !canvasRef.current || !videoState.video) return

    context.drawImage(videoState.video, 0, 0, canvasRef.current.width, canvasRef.current.height)

    requestAnimationFrame(() => draw(context))
  }

  const playOrPause = () => {
    if (!videoState.video) return
    console.log('toggling.. play pause')
    videoState.video.paused ? videoState.video.play() : videoState.video.pause()
  }

  const setFormattedTime = (value: string | number, cut?: string) => {
    if (videoState.video) {
      videoState.video.currentTime = Number(value)

      const _currentTime = moment()
        .startOf('day')
        .seconds(videoState.video?.currentTime)
        .format('H:mm:ss')

      setCurrentTime(_currentTime)

      switch (cut) {
        case 'end':
          setCutEndTime(_currentTime)
          break
        case 'start':
          setCutStartTime(_currentTime)
        default:
      }
    }
  }

  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return
    const context = canvasRef.current.getContext('2d')

    if (context) {
      setCtx(context)
      draw(context)
    }
  }, [canvasRef, canvasRef.current, videoState.video])

  return {
    handleFileChange,
    playOrPause,
    setFormattedTime,
    canvasRef,
    videoState,
    currentTime,
    cutStartTime,
    cutEndTime,
    ctx,
  }
}
