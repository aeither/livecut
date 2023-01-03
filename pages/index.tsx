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
      {/* {spinning && (
        <Spin spinning={spinning} tip={tip}>
          <div className="component-spin" />
        </Spin>
      )}

      <h2>ffmpeg-online</h2>

      <h4>1. Upload file</h4>
      <Dragger
        multiple
        accept="vide/*"
        beforeUpload={(file, fileList) => {
          setFile(file)
          setFileList(v => [...v, ...fileList])
          setName(file.name)

          handleFileChange(file)
          return false
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file upload</p>
      </Dragger>
      <h4>2. Set ffmpeg options</h4>
      <div className="exec">
        ffmpeg
        <Input
          value={inputOptions}
          placeholder="please enter input options"
          onChange={event => setInputOptions(event.target.value)}
        />
        <Input
          value={name}
          placeholder="please enter input filename"
          onChange={event => setName(event.target.value)}
        />
        <Input
          value={outputOptions}
          placeholder="please enter output options"
          onChange={event => setOutputOptions(event.target.value)}
        />
        <Input
          value={output}
          placeholder="Please enter the download file name"
          onChange={event => setOutput(event.target.value)}
        />
      </div>
      <h4>3. Run and get the output file</h4>
      <Button
        type="primary"
        disabled={!Boolean(file)}
        onClick={() => {
          if (file) handleExec(file, fileList)
        }}
      >
        run
      </Button>
      <br />
      <br />
      {href && (
        <a href={href} download={output}>
          download file
        </a>
      )}
      <h4>4. Get other file from file system (use , split)</h4>
      <p style={{ color: 'gray' }}>
        In some scenarios, the output file contains multiple files. At this time, multiple file
        names can be separated by commas and typed into the input box below.
      </p>
      <Input
        value={files}
        placeholder="Please enter the download file name"
        onChange={event => setFiles(event.target.value)}
      />
      <Button type="primary" disabled={!Boolean(file)} onClick={handleGetFiles}>
        confirm
      </Button>
      <br />
      <br />
      {outputFiles.map((outputFile, index) => (
        <div key={index}>
          <a href={outputFile.href} download={outputFile.name}>
            {outputFile.name}
          </a>
          <br />
        </div>
      ))}
      <br /> */}

      {/* Edit Video */}
      {/* <>
        <h2>Video</h2>
        <div style={{ borderWidth: '2px' }}>
          <canvas ref={canvasRef} width="640" height="480"></canvas>
        </div>
        <input
          type="range"
          step={0.05}
          max={String(videoState.video?.duration)}
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
        <Checkbox onChange={(e: CheckboxChangeEvent) => setIsCutVideo(e.target.value)}>
          Cut
        </Checkbox>
        <Button
          onClick={() => {
            if (file) handleExec(file, fileList)
          }}
        >
          Trim video
        </Button>
        <Button
          onClick={() => {
            const x = videoState.video?.duration
            console.log(x)
          }}
        >
          log
        </Button>
        <p>{currentTime}</p>
      </> */}

      {/* Navigation */}
      <div className="navbar bg-base-100">
        <div className="navbar-start">
          <a className="btn-ghost btn text-xl normal-case">Livecut</a>
        </div>
        <div className="navbar-center hidden lg:flex">Progress</div>
        <div className="navbar-end">
          <a className="btn">Connect</a>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-64px)] grid-flow-col grid-rows-3 gap-4">
        <div className="... row-span-3 bg-red-200">
          <h4>1. Upload file</h4>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag and drop some files here, or click to select files</p>
            )}
          </div>
          <h4>2. Set ffmpeg options</h4>
          <div className="exec">
            ffmpeg
            <input
              value={inputOptions}
              placeholder="please enter input options"
              onChange={event => setInputOptions(event.target.value)}
            />
            <input
              value={name}
              placeholder="please enter input filename"
              onChange={event => setName(event.target.value)}
            />
            <input
              value={outputOptions}
              placeholder="please enter output options"
              onChange={event => setOutputOptions(event.target.value)}
            />
            <input
              value={output}
              placeholder="Please enter the download file name"
              onChange={event => setOutput(event.target.value)}
            />
          </div>
        </div>
        <div className="... col-span-1 bg-red-200">
          <h2>Video</h2>
          <div style={{ borderWidth: '2px' }}>
            <canvas ref={canvasRef} width="640" height="480"></canvas>
          </div>
        </div>
        <div className="... col-span-2 row-span-2 bg-red-200">
          <input
            type="range"
            step={0.05}
            max={String(videoState.video?.duration)}
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
          <input
            type="checkbox"
            onChange={e => setIsCutVideo(e.target.checked)}
            className="checkbox"
          />

          <p>{currentTime}</p>
        </div>
        <div className="... col-span-1 bg-red-200">
          <h4>3. Run and get the output file</h4>
          <button
            disabled={!Boolean(file)}
            onClick={() => {
              if (file) handleExec(file, fileList)
            }}
          >
            run
          </button>
          {href && (
            <a href={href} download={output}>
              download file
            </a>
          )}
        </div>
      </div>

      {/* <div className="flex h-[calc(100vh-64px)]">
        <div className="grid w-full grid-cols-5">
          <div className="col-span-1 flex h-full">
            <div className="m-4 flex w-full rounded-lg bg-slate-700 bg-red-400 p-4">hello</div>
          </div>

          <div className="col-span-3 flex h-full">
            <div className="col-span-3 ">
              <div className="m-4 flex w-full rounded-lg bg-slate-700 bg-red-400 p-4">hello</div>
            </div>
          </div>
        </div>
      </div> */}
    </ClientOnly>
  )
}

export default Home
