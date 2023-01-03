import { InboxOutlined } from '@ant-design/icons'
import { Button, Input, Spin, Upload } from 'antd'
import type { NextPage } from 'next'
import { useState } from 'react'
// import numerify from 'numerify/lib/index.cjs'
import { useSnapshot } from 'valtio'
import ClientOnly from '../components/ClientOnly'
import useCanvas from '../hooks/useCanvas'
import useFFmpeg from '../hooks/useFFmpeg'
import FFmpegStore from '../store/valtio'

const { Dragger } = Upload

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

  // Functions

  return (
    <ClientOnly>
      {spinning && (
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
      <br />

      {/* Edit Video */}
      <>
        <h2>Video</h2>
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

export default Home
