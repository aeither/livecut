// import { Button, Input, Upload } from 'antd'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
// import numerify from 'numerify/lib/index.cjs'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSnapshot } from 'valtio'
import ClientOnly from '../components/ClientOnly'
import useCanvas from '../hooks/useCanvas'
import useFFmpeg from '../hooks/useFFmpeg'
import FFmpegStore from '../store/valtio'
import Chat from '../components/chat'
import clsx from 'clsx'

// const { Dragger } = Upload

const Home: NextPage = () => {
  // Edit Video
  const { canvasRef, handleFileChange, playOrPause, setFormattedTime, videoState, currentTime } =
    useCanvas()

  // FFmpeg
  const { handleExec, handleGetFiles } = useFFmpeg()
  const { files, href, inputOptions, name, output, outputOptions, spinning, tip, outputFiles } =
    useSnapshot(FFmpegStore.state)
  const {
    setFiles,
    setHref,
    setInputOptions,
    setName,
    setOutput,
    setOutputOptions,
    setSpinning,
    setTip,
    setOutputFiles,
  } = FFmpegStore

  const [file, setFile] = useState<File>()
  const [fileList, setFileList] = useState<File[]>([])

  const [isCutVideo, setIsCutVideo] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  // Functions
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
    setFileList(v => [...v, ...acceptedFiles])
    setName(acceptedFiles[0].name)
    handleFileChange(acceptedFiles[0])
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const onUpdateRange = () => {
    console.log('isCutVideo: ', isCutVideo)
    if (isCutVideo) {
      setOutputOptions(`-ss 00:00:00 -t ${currentTime} -c:v copy -c:a copy`)
      console.log('output options: ', outputOptions)
    } else {
      setOutputOptions('')
    }
  }
  useEffect(() => {
    onUpdateRange()
  }, [currentTime])

  return (
    <ClientOnly>
      {/* Navigation */}
      <div className="navbar bg-base-100 p-0">
        <div className="navbar-start pl-4">
          <div className="w-32">
            <img src="/images/livecut-logo-text-transparent.png" width="100%" alt="" />
          </div>
          {/* <a className="btn-ghost btn text-xl normal-case">Livecut</a> */}
        </div>
        <div className="navbar-center hidden lg:flex">
          <progress className="progress progress-success w-72"></progress>
        </div>
        <div className="navbar-end pr-4">
          <a className="btn">Connect</a>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-64px-64px)] grid-cols-5 gap-4 md:px-4">
        <div className="col-span-1 row-span-5 rounded-xl bg-base-200 p-4">
          <h4>1. Upload file</h4>
          <div className="rounded-2xl border-dashed bg-neutral p-8" {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here to upload...</p>
            ) : (
              <p>Drop here, or click to select</p>
            )}
          </div>
          <h4>2. Advanced Configuration</h4>
          <div className="flex w-full flex-col gap-2">
            <input
              value={inputOptions}
              className="input max-w-xs"
              placeholder="please enter input options"
              onChange={event => setInputOptions(event.target.value)}
            />
            <input
              value={name}
              className="input max-w-xs"
              placeholder="please enter input filename"
              onChange={event => setName(event.target.value)}
            />
            <input
              value={outputOptions}
              className="input max-w-xs"
              placeholder="please enter output options"
              onChange={event => setOutputOptions(event.target.value)}
            />
            <input
              value={output}
              className="input max-w-xs"
              placeholder="Please enter the download file name"
              onChange={event => setOutput(event.target.value)}
            />
          </div>

          <h4>3. Run and get the output file</h4>
          <button
            disabled={!Boolean(file)}
            className="btn"
            onClick={() => {
              if (file) handleExec(file, fileList)
            }}
          >
            Export
          </button>
          {href && (
            <a href={href} download={output}>
              download file
            </a>
          )}
        </div>
        <div className="col-span-3 row-span-4 rounded-xl bg-base-200 p-4">
          <h2>Video</h2>
          <div className="flex justify-center">
            <div className="flex overflow-hidden rounded-2xl">
              <canvas ref={canvasRef} width="740" height="610"></canvas>
            </div>
          </div>
        </div>
        <div className="col-span-1 row-span-4 rounded-xl bg-base-200 p-4">
          <div className="tabs tabs-boxed flex justify-around pb-2">
            {['Chat', 'Meet'].map((name, index) => (
              <>
                <a
                  onClick={() => setActiveTab(index)}
                  className={clsx('tab tab-lg', activeTab === index && 'tab-active')}
                >
                  {name}
                </a>
              </>
            ))}
          </div>
          <div className={clsx('card', activeTab !== 0 && 'hidden')}>
            <Chat />
          </div>
          <div className={clsx('card', activeTab !== 1 && 'hidden')}>
            <div>hello world</div>
          </div>
        </div>
        <div className="col-span-4 row-span-1 rounded-xl bg-base-200 p-4">
          <input
            type="range"
            step={0.05}
            className="range"
            min="0"
            max={String(videoState.video?.duration)}
            onChange={e => setFormattedTime(e.target.value)}
          />
          <button
            className="btn"
            onClick={() => {
              if (videoState.video && videoState.video.currentTime > 2)
                videoState.video.currentTime -= 2
            }}
          >
            Back
          </button>
          <button
            className="btn"
            onClick={() => {
              if (videoState.video) videoState.video.currentTime += 2
            }}
          >
            Forward
          </button>
          <button
            className="btn"
            onClick={() => {
              playOrPause()
            }}
          >
            Play / Pause
          </button>
          <input
            type="checkbox"
            onChange={e => setIsCutVideo(e.target.checked)}
            className="checkbox"
          />

          <p>{currentTime}</p>
        </div>
      </div>
    </ClientOnly>
  )
}

export default Home
