import { proxy } from 'valtio'

/**
 * Types
 */
type OutputFile = {
  name: string
  href: string
}

interface State {
  spinning: boolean
  tip: boolean
  progress: number | undefined
  inputOptions: string
  outputOptions: string
  files: string
  href: string
  name: string
  output: string
  outputFiles: OutputFile[]
}

/**
 * State
 */
const state = proxy<State>({
  spinning: false,
  tip: false,
  progress: 0,
  inputOptions: '-i',
  outputOptions: '',
  files: '',
  href: '',
  name: 'input.mp4',
  output: 'output.mp4',
  outputFiles: [],
})

/**
 * Store / Actions
 */
const FFmpegStore = {
  state,

  setSpinning: (spinning: boolean) => {
    state.spinning = spinning
  },
  setTip: (tip: boolean) => {
    state.tip = tip
  },
  setProgress: (progress: number | undefined) => {
    state.progress = progress
  },
  setInputOptions: (inputOptions: string) => {
    state.inputOptions = inputOptions
  },
  setOutputOptions: (outputOptions: string) => {
    state.outputOptions = outputOptions
  },
  setFiles: (files: string) => {
    state.files = files
  },
  setHref: (href: string) => {
    state.href = href
  },
  setName: (name: string) => {
    state.name = name
  },
  setOutput: (output: string) => {
    state.output = output
  },
  setOutputFiles: (outputFiles: OutputFile[]) => {
    state.outputFiles = outputFiles
  },
}

export default FFmpegStore
