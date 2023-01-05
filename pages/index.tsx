import clsx from 'clsx'
import type { NextPage } from 'next'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSnapshot } from 'valtio'
import BundlrUploader from '../components/Bundlr'
import Chat from '../components/Chat'
import ClientOnly from '../components/ClientOnly'
import { Play, SkipBack, SkipForward } from '../components/Icons/VideoIcons'
import MintAptos from '../components/MintAptos'
import Navigation from '../components/Navigation'
import Video from '../components/Video'
import useCanvas from '../hooks/useCanvas'
import useFFmpeg from '../hooks/useFFmpeg'
import FFmpegStore from '../store/valtio'

const Home: NextPage = () => {
  const {
    handleFileChange,
    canvasRef,
    playOrPause,
    setFormattedTime,
    videoState,
    currentTime,
    cutStartTime,
    cutEndTime,
  } = useCanvas()

  // FFmpeg
  const { handleExec } = useFFmpeg()
  const { href, inputOptions, name, output, outputOptions } = useSnapshot(FFmpegStore.state)
  const { setInputOptions, setName, setOutput, setOutputOptions } = FFmpegStore

  const [file, setFile] = useState<File>()
  const [fileList, setFileList] = useState<File[]>([])

  const [isCutVideo, setIsCutVideo] = useState(false)
  const [leftActiveTab, setLeftActiveTab] = useState(0)
  const [activeTab, setActiveTab] = useState(0)

  const onUpdateRange = () => {
    console.log('isCutVideo: ', isCutVideo)
    if (isCutVideo) {
      setOutputOptions(`-ss ${cutStartTime} -t ${cutEndTime} -c:v copy -c:a copy`)
    } else {
      setOutputOptions('')
    }
  }
  useEffect(() => {
    onUpdateRange()
  }, [currentTime])

  const VideoMedia = () => {
    // Functions
    const onDrop = useCallback((acceptedFiles: File[]) => {
      setFile(acceptedFiles[0])
      setFileList(v => [...v, ...acceptedFiles])
      setName(acceptedFiles[0].name)

      // canvas
      handleFileChange(acceptedFiles[0])
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
      <>
        {/* <VideoMedia /> */}
        <h4>Upload video</h4>
        <div className="rounded-2xl border-dashed bg-neutral p-8" {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here to upload...</p>
          ) : (
            <p>Drop here, or click to select</p>
          )}
        </div>

        {fileList &&
          fileList.map((file, i) => {
            const url = URL.createObjectURL(file)

            return (
              <div className="mt-4 flex p-2" key={i}>
                <div className="overflow-hidden rounded-lg hover:ring">
                  <video src={url} width="100%"></video>
                </div>
              </div>
            )
          })}
      </>
    )
  }

  const VideoSettings = () => {
    return (
      <>
        {/* <VideoSettings /> */}
        <div className="collapse">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-xl font-medium">Advanced Configuration</div>

          <div className="collapse-content">
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
          </div>
        </div>

        <h4>Convert</h4>
        <button
          disabled={!Boolean(file)}
          className="btn"
          onClick={() => {
            if (file) handleExec(file, fileList)
          }}
        >
          Render
        </button>
        {href && (
          <a className="p-4" href={href} download={output}>
            Completed
          </a>
        )}

        {href && <BundlrUploader />}

        <MintAptos video={file} />
      </>
    )
  }

  return (
    <ClientOnly>
      <Navigation />

      <div className="grid min-h-[calc(100vh-64px-64px)] grid-cols-5 gap-4 md:px-4">
        <div className="col-span-1 row-span-5 rounded-xl bg-base-200 p-4">
          <div className="flex h-full flex-col">
            <div className="tabs tabs-boxed flex justify-around pb-2">
              {['Media', 'Deliver'].map((name, index) => (
                <a
                  key={index}
                  onClick={() => setLeftActiveTab(index)}
                  className={clsx('tab tab-lg', leftActiveTab === index && 'tab-active')}
                >
                  {name}
                </a>
              ))}
            </div>
            <div className={clsx('flex h-full flex-col', leftActiveTab !== 0 && 'hidden')}>
              <VideoMedia />
            </div>
            <div className={clsx('flex h-full flex-col', leftActiveTab !== 1 && 'hidden')}>
              <VideoSettings />
            </div>
          </div>
        </div>
        <div className="col-span-3 row-span-4 rounded-xl bg-base-200 p-4">
          {/* <h2>Video</h2> */}
          <div className="flex h-full flex-col justify-between">
            <div className="flex justify-center">
              <div className="flex overflow-hidden rounded-2xl">
                {videoState.video && <canvas ref={canvasRef} width="740" height="460"></canvas>}
              </div>
            </div>
            <div className="flex justify-between p-2 ">
              <p>{currentTime}</p>
              <div className="flex items-center gap-2">
                <button
                  className="btn-circle btn"
                  onClick={() => {
                    if (videoState.video && videoState.video.currentTime > 2)
                      videoState.video.currentTime -= 2
                  }}
                >
                  <SkipBack />
                </button>
                <button
                  className="btn-circle btn-lg btn"
                  onClick={() => {
                    playOrPause()
                  }}
                >
                  <Play />
                </button>
                <button
                  className="btn-circle btn"
                  onClick={() => {
                    if (videoState.video) videoState.video.currentTime += 2
                  }}
                >
                  <SkipForward />
                </button>
              </div>

              <p></p>
            </div>
          </div>
        </div>
        <div className="col-span-1 row-span-4 rounded-xl bg-base-200 p-4">
          <div className="tabs tabs-boxed flex justify-around pb-2">
            {['Chat', 'Meet'].map((name, index) => (
              <a
                key={index}
                onClick={() => setActiveTab(index)}
                className={clsx('tab tab-lg', activeTab === index && 'tab-active')}
              >
                {name}
              </a>
            ))}
          </div>
          <div className={clsx(activeTab !== 0 && 'hidden')}>
            <Chat />
          </div>
          <div className={clsx(activeTab !== 1 && 'hidden')}>
            <Video />
          </div>
        </div>
        <div className="col-span-4 row-span-1 rounded-xl bg-base-200 p-4">
          <label className="label flex cursor-pointer justify-start">
            <span className="label-text">Cut video</span>
            <div className="m-1 flex items-center justify-center rounded bg-base-300">
              <input
                type="checkbox"
                onChange={e => setIsCutVideo(e.target.checked)}
                className="checkbox-primary checkbox"
              />
            </div>
          </label>
          <input
            type="range"
            step={0.05}
            className="range range-secondary"
            min="0"
            max={String(videoState.video?.duration)}
            onChange={e => setFormattedTime(e.target.value, 'start')}
          />
          <input
            type="range"
            step={0.05}
            className="range range-accent"
            min="0"
            max={String(videoState.video?.duration)}
            onChange={e => setFormattedTime(e.target.value)}
          />
          <p>
            From {cutStartTime} to {cutEndTime}
          </p>
        </div>
      </div>
    </ClientOnly>
  )
}

export default Home
