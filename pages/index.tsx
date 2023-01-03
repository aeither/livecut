import type { NextPage } from 'next'
import { Spin, Upload, Input, Button, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg'
import { InboxOutlined } from '@ant-design/icons'
import { fileTypeFromBuffer } from 'file-type'
// import numerify from 'numerify/lib/index.cjs'
import qs from 'query-string'
import useFFmpeg from '../hooks/useFFmpeg'
import FFmpegStore from '../store/valtio'
import { useSnapshot } from 'valtio'

const { Dragger } = Upload

const Home: NextPage = () => {
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

  // Edit Video

  // Functions

  return (
    <div className="page-app">
      {spinning && (
        <Spin spinning={spinning} tip={tip}>
          <div className="component-spin" />
        </Spin>
      )}

      <h2>ffmpeg-online</h2>

      <h4>1. Upload file</h4>
      <Dragger
        multiple
        beforeUpload={(file, fileList) => {
          setFile(file)
          setFileList(v => [...v, ...fileList])
          setName(file.name)
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
    </div>
  )
}

export default Home
