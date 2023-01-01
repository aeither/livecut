import ClientOnly from '../components/ClientOnly'
import { Client } from '@xmtp/xmtp-js'
import { Wallet } from 'ethers'
import { useSigner } from 'wagmi'

declare global {
  interface Window {
    aptos: any
    martian: any | undefined
  }
}

export default function Chat() {
  const { data: signer } = useSigner()

  const setup = async () => {
    if (!signer) throw new Error('No Signer')

    const xmtp = await Client.create(signer)

    const conversation = await xmtp.conversations.newConversation(
      '0x3F11b27F323b62B159D2642964fa27C46C841897'
    )
    // Load all messages in the conversation
    const messages = await conversation.messages()
    // Send a message
    await conversation.send('gm')
  }
  return (
    <ClientOnly>
      <>
        <button onClick={() => console.log('')}>click</button>
      </>
    </ClientOnly>
  )
}
