import { useHuddleStore } from '@huddle01/huddle01-client/store'
import { useContext } from 'react'
import { StateContext } from '../store/context'
import ClientOnly from './ClientOnly'
import { MicOnIcon, VideoOnIcon } from './Icons/VideoIcons'
import StreamVideo from './StreamVideo'
import VideoAudio from './VideoAudio'
declare global {
  interface Window {
    aptos: any
    martian: any | undefined
  }
}

export default function Video() {
  const { huddleClient } = useContext(StateContext)
  const peersKeys = useHuddleStore(state => Object.keys(state.peers))
  const roomState = useHuddleStore(state => state.roomState)
  const lobbyPeers = useHuddleStore(state => state.lobbyPeers)

  const handleJoin = async () => {
    try {
      await huddleClient.join('livecut', {
        address: '',
        wallet: '',
        ens: '',
      })

      console.log('joined')
    } catch (error) {
      console.log({ error })
    }
  }

  return (
    <ClientOnly>
      <div>
        <h2 className={``}>
          {roomState.joined ? (
            <>In Meeting</>
          ) : (
            <button className="btn-accent btn-block btn" onClick={handleJoin}>
              Start Meet
            </button>
          )}
        </h2>
      </div>

      <div>
        <div className="card">
          <div className="flex justify-around p-4">
            <button onClick={() => huddleClient.enableWebcam()} className="btn-circle btn">
              <VideoOnIcon />
            </button>
            <button onClick={() => huddleClient.enableMic()} className="btn-circle btn">
              <MicOnIcon />
            </button>
          </div>
        </div>

        <StreamVideo />

        {lobbyPeers[0] && <h2>In waiting room</h2>}
        <div>
          {lobbyPeers.map(peer => (
            <div className="p-4" key={peer.peerId}>
              {peer.peerId}
            </div>
          ))}
        </div>

        <button
          className="btn-block btn"
          onClick={() => huddleClient.allowAllLobbyPeersToJoinRoom()}
        >
          Allow join
        </button>

        {peersKeys[0] && <h2>Peers</h2>}

        <div className="peers-grid">
          {peersKeys.map(key => (
            <VideoAudio key={`peerId-${key}`} peerIdAtIndex={key} />
          ))}
        </div>
      </div>
    </ClientOnly>
  )
}
