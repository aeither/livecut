// import { ConnectWallet, useWeb3 } from "@fewcha/web3-react";

import ClientOnly from "../components/ClientOnly";
import { useHuddleStore } from "@huddle01/huddle01-client/store";
import { state } from "../state/state";
import { useSnapshot } from "valtio";
import { getHuddleClient } from "@huddle01/huddle01-client";
import StreamVideo from "../components/StreamVideo";
import VideoAudio from "../components/VideoAudio";
import { useContext } from "react";
import { StateContext } from "../state/context";
declare global {
  interface Window {
    aptos: any;
    martian: any | undefined;
  }
}

export default function Video() {
  //   const huddleClient: ReturnType<typeof getHuddleClient> =
  //     state.huddleClient as any;
  const { huddleClient } = useContext(StateContext);
  //   const huddleClient = getHuddleClient(process.env.NEXT_PUBLIC_HUDDLE_KEY);
  const peersKeys = useHuddleStore((state) => Object.keys(state.peers));
  const lobbyPeers = useHuddleStore((state) => state.lobbyPeers);
  const roomState = useHuddleStore((state) => state.roomState);

  const handleJoin = async () => {
    try {
      await huddleClient.join("dev", {
        address: "0x554fAFF9260C1bB9D6b8eEfd4848d1BCa0171555",
        wallet: "",
        ens: "axit.eth",
      });

      console.log("joined");
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <ClientOnly>
      <div>
        <h1>Vite + React</h1>

        <h2 className={`text-${!roomState.joined ? "red" : "green"}`}>
          Room Joined:&nbsp;{roomState.joined.toString()}
        </h2>
      </div>

      <div>
        <div className="card">
          <button onClick={handleJoin}>Join Room</button>
          <button onClick={() => huddleClient.enableWebcam()}>
            Enable Webcam
          </button>
          <button onClick={() => huddleClient.disableWebcam()}>
            Disable Webcam
          </button>
          <button onClick={() => huddleClient.allowAllLobbyPeersToJoinRoom()}>
            allowAllLobbyPeersToJoinRoom()
          </button>
        </div>

        <StreamVideo />

        {lobbyPeers[0] && <h2>Lobby Peers</h2>}
        <div>
          {lobbyPeers.map((peer) => (
            <div key={peer.peerId}>{peer.peerId}</div>
          ))}
        </div>

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
