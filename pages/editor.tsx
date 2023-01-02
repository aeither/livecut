import { useAccount, useSigner } from 'wagmi'
import ClientOnly from '../components/ClientOnly'
import useFFmpeg from '../hooks/useFFmpeg'
import { useAppStore } from '../store/state'

declare global {
  interface Window {
    aptos: any
    martian: any | undefined
  }
}

export default function Chat() {
  const { isConnected } = useAccount()
  const { data: signer } = useSigner()
  const videoURL = useAppStore(state => state.videoURL)
  const videoProgress = useAppStore(state => state.videoProgress)
  const { handleFileChange } = useFFmpeg()
  return (
    <ClientOnly>
      <>
        <h4>1. Upload file</h4>
        <input
          type="file"
          name="file"
          id="file"
          onChange={e => handleFileChange(e)}
          //   ref={fileRef}
        />
        {videoProgress && (
          <>
            <div>Duration: {videoProgress?.duration}</div>
            <div>Time: {videoProgress?.time}</div>
            <div>Ratio: {videoProgress?.ratio}</div>
          </>
        )}

        {videoURL && (
          <>
            <video src={videoURL} width={'400px'} height={'400px'} autoPlay controls />
          </>
        )}

        <button onClick={() => console.log(videoProgress)}>log progress</button>
      </>
    </ClientOnly>
  )
}
