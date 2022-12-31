import { ConnectKitButton } from "connectkit";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import ClientOnly from "../components/ClientOnly";

declare global {
  interface Window {
    aptos: any;
    martian: any | undefined;
  }
}

export default function Profile() {
  const { address, isConnecting, isDisconnected } = useAccount();

  const { data: name } = useEnsName({
    address: address,
  });
  const { data: avatar } = useEnsAvatar({
    address: address,
  });

  return (
    <ClientOnly>
      <>
        <ConnectKitButton />
        <div>Name: {name}</div>
        <div>Avatar: </div>
        <img src={avatar || ""} alt="avatar" />
        {/* {isConnected ? (
          <button onClick={() => disconnect()}>Disconnect</button>
        ) : (
          <div>Connected to {activeConnector?.name}</div>
        )}

        {connectors.map((connector) => (
          <button
            disabled={!connector.ready}
            key={connector.id}
            onClick={() => connect({ connector })}
          >
            {connector.name}
            {isLoadingConnect &&
              pendingConnector?.id === connector.id &&
              " (connecting)"}
          </button>
        ))}

        {chain && <div>Connected to {chain.name}</div>}

        {chains.map((x) => (
          <button
            disabled={!switchNetwork || x.id === chain?.id}
            key={x.id}
            onClick={() => switchNetwork?.(x.id)}
          >
            {x.name}
            {isLoadingSwitch && pendingChainId === x.id && " (switching)"}
          </button>
        ))} */}
      </>
    </ClientOnly>
  );
}
