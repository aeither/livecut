import { getHuddleClient, HuddleClientProvider } from '@huddle01/huddle01-client'
import { createReactClient, LivepeerConfig, studioProvider } from '@livepeer/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AptosClient } from 'aptos'
import { ConnectKitProvider, getDefaultClient } from 'connectkit'
import type { AppProps } from 'next/app'
import { createContext, useMemo } from 'react'
import { Toaster } from 'react-hot-toast'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { goerli, mainnet, optimismGoerli, polygon, polygonMumbai } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { StateContext } from '../store/context'
import '../styles/globals.css'

export const AptosContext = createContext<AptosClient | null>(null)

const { chains, provider, webSocketProvider } = configureChains(
  [goerli, mainnet, optimismGoerli, polygonMumbai, polygon],
  [publicProvider()]
)

const client = createClient(
  getDefaultClient({
    appName: 'Livecut',
    autoConnect: true,
    provider,
    chains,
    webSocketProvider,
  })
)

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  const huddleClient = getHuddleClient(process.env.NEXT_PUBLIC_HUDDLE_KEY)
  const livepeerClient = createReactClient({
    provider: studioProvider({ apiKey: process.env.NEXT_PUBLIC_LIVEPEER_API }),
  })

  const aptosClient = useMemo(() => new AptosClient('https://fullnode.devnet.aptoslabs.com/v1'), [])

  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider theme="midnight">
        <StateContext.Provider value={{ huddleClient }}>
          <HuddleClientProvider value={huddleClient}>
            <AptosContext.Provider value={aptosClient}>
              <LivepeerConfig client={livepeerClient}>
                <QueryClientProvider client={queryClient}>
                  <Component {...pageProps} />
                  <Toaster />
                </QueryClientProvider>
              </LivepeerConfig>
            </AptosContext.Provider>
          </HuddleClientProvider>
        </StateContext.Provider>
      </ConnectKitProvider>
    </WagmiConfig>
  )
}

export default MyApp
