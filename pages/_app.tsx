import {
  createReactClient,
  LivepeerConfig,
  studioProvider,
} from "@livepeer/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AptosClient } from "aptos";
import type { AppProps } from "next/app";
import "../styles/globals.css";

import { createContext, useMemo } from "react";

import {
  HuddleClientProvider,
  getHuddleClient,
} from "@huddle01/huddle01-client";
import { state } from "../state/state";
import { StateContext } from "../state/context";

export const AptosContext = createContext<AptosClient | null>(null);

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const huddleClient = getHuddleClient(process.env.NEXT_PUBLIC_HUDDLE_KEY);
  state.huddleClient = huddleClient;

  const livepeerClient = createReactClient({
    provider: studioProvider({ apiKey: process.env.NEXT_PUBLIC_LIVEPEER_API }),
  });

  const aptosClient = useMemo(
    () => new AptosClient("https://fullnode.devnet.aptoslabs.com/v1"),
    []
  );

  return (
    <StateContext.Provider value={{ huddleClient }}>
      <HuddleClientProvider value={huddleClient}>
        <AptosContext.Provider value={aptosClient}>
          <LivepeerConfig client={livepeerClient}>
            <QueryClientProvider client={queryClient}>
              <Component {...pageProps} />
            </QueryClientProvider>
          </LivepeerConfig>
        </AptosContext.Provider>
      </HuddleClientProvider>
    </StateContext.Provider>
  );
}

export default MyApp;
