import type { NextPage } from 'next'
import { Spin, Upload, Input, Button, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg'
import { InboxOutlined } from '@ant-design/icons'
import { fileTypeFromBuffer } from 'file-type'
// import numerify from 'numerify/lib/index.cjs'
import qs from 'query-string'

const { Dragger } = Upload

type IOOptions = string | (string | null)[] | null

type OutputFile = {
  name: string
  href: string
}

const Home: NextPage = () => {
  const [spinning, setSpinning] = useState(false)
  const [tip, setTip] = useState(false)
  const [inputOptions, setInputOptions] = useState<IOOptions>('-i')
  const [outputOptions, setOutputOptions] = useState<IOOptions>('')
  const [files, setFiles] = useState('')
  const [outputFiles, setOutputFiles] = useState<OutputFile[]>([])
  const [href, setHref] = useState('')
  const [file, setFile] = useState<File>()
  const [fileList, setFileList] = useState<File[]>([])
  const [name, setName] = useState('input.mp4')
  const [output, setOutput] = useState('output.mp4')
  const ffmpeg = useRef<FFmpeg>()

  const handleExec = async () => {
    if (!file || !ffmpeg || !ffmpeg.current) {
      return
    }
    setOutputFiles([])
    try {
      setTip('Loading file into browser')
      setSpinning(true)
      for (const fileItem of fileList) {
        ffmpeg.current.FS('writeFile', fileItem.name, await fetchFile(fileItem))
      }
      setTip('start executing the command')
      await ffmpeg.current.run(
        ...inputOptions.split(' '),
        name,
        ...outputOptions.split(' '),
        output
      )
      setSpinning(false)

      const data = ffmpeg.current.FS('readFile', output)
      const type = await fileTypeFromBuffer(data.buffer)
      if (type) {
        const objectURL = URL.createObjectURL(new Blob([data.buffer], { type: type.mime }))
        setHref(objectURL)
      }
      message.success('Run successfully, click the download button to download the output file', 10)
    } catch (err) {
      console.error(err)
      message.error(
        'Failed to run, please check if the command is correct or open the console to view the error details',
        10
      )
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

        const objectURL = URL.createObjectURL(new Blob([data.buffer], { type: type.mime }))
        outputFilesData.push({
          name: filename,
          href: objectURL,
        })
      } catch (err) {
        message.error(`${filename} get failed`)
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
        setTip(ratio)
      })
      setTip('ffmpeg static resource loading...')
      setSpinning(true)
      await ffmpeg.current.load()
      setSpinning(false)
    })()
  }, [])

  useEffect(() => {
    const { inputOptions, outputOptions } = qs.parse(window.location.search)
    if (inputOptions) {
      setInputOptions(inputOptions)
    }
    if (outputOptions) {
      setOutputOptions(outputOptions)
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
      <Button type="primary" disabled={!Boolean(file)} onClick={handleExec}>
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

    </div>
  )
}

export default Home
