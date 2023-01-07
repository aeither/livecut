import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg'
import { fileTypeFromBuffer } from 'file-type'
import { useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio'
import FFmpegStore from '../store/valtio'
import qs from 'query-string'

export default function useFFmpeg() {
  const { files, href, inputOptions, name, output, outputOptions, progress, tip, outputFiles } =
    useSnapshot(FFmpegStore.state)
  const { setInputOptions, setOutputOptions, setOutputFiles, setHref, setProgress } = FFmpegStore

  const ffmpeg = useRef<FFmpeg>()

  const handleExec = async (file: File, fileList: File[]) => {
    if (!file || !ffmpeg || !ffmpeg.current) {
      return
    }
    setOutputFiles([])
    try {
      for (const fileItem of fileList) {
        ffmpeg.current.FS('writeFile', fileItem.name, await fetchFile(fileItem))
      }
      await ffmpeg.current.run(
        ...inputOptions.split(' '),
        name,
        ...outputOptions.split(' '),
        output
      )

      const data = ffmpeg.current.FS('readFile', output)
      const type = await fileTypeFromBuffer(data.buffer)
      if (type) {
        const objectURL = URL.createObjectURL(new Blob([data.buffer], { type: type.mime }))
        setHref(objectURL)
        setProgress(0)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleGetFiles = async () => {
    if (!files || !ffmpeg || !ffmpeg.current) {
      return
    }
    const filenames = files
      .split(',')
      .filter(i => i)
      .map(i => i.trim())
    const outputFilesData = []
    for (let filename of filenames) {
      try {
        const data = ffmpeg.current.FS('readFile', filename)
        const type = await fileTypeFromBuffer(data.buffer)

        const objectURL = URL.createObjectURL(new Blob([data.buffer], { type: type?.mime }))
        outputFilesData.push({
          name: filename,
          href: objectURL,
        })
      } catch (err) {
        console.error(err)
      }
    }
    setOutputFiles(outputFilesData)
  }

  useEffect(() => {
    ;(async () => {
      ffmpeg.current = createFFmpeg({
        log: true,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
      })
      ffmpeg.current.setProgress(({ ratio }) => {
        console.log(ratio)
        setProgress(Math.ceil(ratio * 100))
      })
      console.log('loading ffmpeg')
      await ffmpeg.current.load()
      console.log('loaded ffmpeg')
    })()
  }, [])

  useEffect(() => {
    const { inputOptions, outputOptions } = qs.parse(window.location.search)
    if (inputOptions) {
      setInputOptions(inputOptions as string)
    }
    if (outputOptions) {
      setOutputOptions(outputOptions as string)
    }
  }, [])

  useEffect(() => {
    // run after inputOptions and outputOptions set from querystring
    setTimeout(() => {
      let queryString = qs.stringify({ inputOptions, outputOptions })
      const newUrl = `${location.origin}${location.pathname}?${queryString}`
      history.pushState('', '', newUrl)
    })
  }, [inputOptions, outputOptions])

  // const transcode = async (file: File) => {
  //   if (!ffmpeg.current) return

  //   const { name } = file

  //   // load ffmpeg.wasm code
  //   await ffmpeg.current.load()
  //   // write file to  memory filesystem
  //   ffmpeg.current.FS('writeFile', name, await fetchFile(file))
  //   // convert video into mp4
  //   await ffmpeg.current.run('-i', name, 'output.mp4')
  //   // read file from Memory filesystem
  //   const data = ffmpeg.current.FS('readFile', 'output.mp4')
  //   const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))

  //   setVideoURL(url)
  //   setVideoProgress(null)
  // }

  // const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   // start video conversion on file change
  //   const file = e.target.files && e.target.files[0]
  //   if (file) transcode(file)
  // }

  // const cleanUp = () => {
  //   // revoke created blob url object
  //   if (!videoURL) return
  //   URL.revokeObjectURL(videoURL)
  // }

  return {
    ffmpeg,
    handleExec,
    handleGetFiles,
  }
}
