import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSnapshot } from 'valtio'
import useCanvas from '../hooks/useCanvas'
import useFFmpeg from '../hooks/useFFmpeg'
import FFmpegStore from '../store/valtio'

const VideoSettings = () => {
  // Edit Video
  const { handleFileChange } = useCanvas()

  // FFmpeg
  const { handleExec } = useFFmpeg()
  const { href, inputOptions, name, output, outputOptions } = useSnapshot(FFmpegStore.state)
  const { setInputOptions, setName, setOutput, setOutputOptions } = FFmpegStore

  const [file, setFile] = useState<File>()
  const [fileList, setFileList] = useState<File[]>([])

  // Functions
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
    setFileList(v => [...v, ...acceptedFiles])
    setName(acceptedFiles[0].name)
    handleFileChange(acceptedFiles[0])
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <>
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
    </>
  )
}

export default VideoSettings
