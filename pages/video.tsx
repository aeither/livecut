import { useHuddleStore } from "@huddle01/huddle01-client/store";
import { useContext } from "react";
import ClientOnly from "../components/ClientOnly";
import StreamVideo from "../components/StreamVideo";
import VideoAudio from "../components/VideoAudio";
import { StateContext } from "../state/context";
declare global {
  interface Window {
    aptos: any;
    martian: any | undefined;
  }
}

export default function Video() {
  const { huddleClient } = useContext(StateContext);
  const peersKeys = useHuddleStore((state) => Object.keys(state.peers));
  const roomState = useHuddleStore((state) => state.roomState);
  const lobbyPeers = useHuddleStore((state) => state.lobbyPeers);

  const handleJoin = async () => {
    try {
      await huddleClient.join("livecut", {
        address: "",
        wallet: "",
        ens: "",
      });

      console.log("joined");
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <ClientOnly>
      <div>
        <h2 className={`text-${!roomState.joined ? "red" : "green"}`}>
          Room Joined:&nbsp;{roomState.joined.toString()}
        </h2>
      </div>

      <div>
        <div className="card">
          <button onClick={handleJoin}>Start Meet</button>
          <button onClick={() => huddleClient.enableWebcam()}>
            Enable Webcam
          </button>
          <button onClick={() => huddleClient.disableWebcam()}>
            Disable Webcam
          </button>
          {/* <button onClick={() => huddleClient.allowAllLobbyPeersToJoinRoom()}>
            allowAllLobbyPeersToJoinRoom()
          </button> */}
        </div>

        <StreamVideo />

        {/* {lobbyPeers[0] && <h2>Lobby Peers</h2>}
        <div>
          {lobbyPeers.map((peer) => (
            <div key={peer.peerId}>{peer.peerId}</div>
          ))}
        </div> */}

        {peersKeys[0] && <h2>Peers</h2>}

        <div className="peers-grid">
          {peersKeys.map((key) => (
            <VideoAudio key={`peerId-${key}`} peerIdAtIndex={key} />
          ))}
        </div>
      </div>
    </ClientOnly>
  );
}