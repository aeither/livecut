import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg'
import { ChangeEvent, useEffect, useRef } from 'react'
import { useAppStore } from '../store/state'

export default function useFFmpeg() {
  const videoURL = useAppStore(state => state.videoURL)
  const setVideoProgress = useAppStore(state => state.setVideoProgress)
  const setVideoURL = useAppStore(state => state.setVideoURL)

  const ffmpeg = useRef<FFmpeg>()

  useEffect(() => {
    ;(async () => {
      ffmpeg.current = createFFmpeg({
        log: true,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
        // corePath: '/static/ffmpeg-core.js',
      })
      ffmpeg.current.setProgress(({ ratio }) => {
        console.log(ratio)
      })
      await ffmpeg.current.load()
    })()
  }, [])

  //   const ffmpeg = createFFmpeg({
  //     progress: e => setVideoProgress(e),
  //     log: true,
  //     corePath: '/static/ffmpeg-core.js',
  //   })

  const transcode = async (file: File) => {
    if (!ffmpeg.current) return

    const { name } = file

    // load ffmpeg.wasm code
    await ffmpeg.current.load()
    // write file to  memory filesystem
    ffmpeg.current.FS('writeFile', name, await fetchFile(file))
    // convert video into mp4
    await ffmpeg.current.run('-i', name, 'output.mp4')
    // read file from Memory filesystem
    const data = ffmpeg.current.FS('readFile', 'output.mp4')
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))

    setVideoURL(url)
    setVideoProgress(null)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    // start video conversion on file change
    const file = e.target.files && e.target.files[0]
    if (file) transcode(file)
  }

  const cleanUp = () => {
    // revoke created blob url object
    if (!videoURL) return
    URL.revokeObjectURL(videoURL)
  }
  return {
    handleFileChange,
  }
}
