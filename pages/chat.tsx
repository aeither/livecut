import ClientOnly from '../components/ClientOnly'
import { Client } from '@xmtp/xmtp-js'
import { Wallet } from 'ethers'
import { useAccount, useConnect, useSigner } from 'wagmi'
import MessageComposer from '../components/MessageComposer'
import useSendMessage from '../hooks/useSendMessage'
import { useAppStore } from '../store/state'
import { useCallback, useEffect, useState } from 'react'
import useInitXmtpClient from '../hooks/useInitXmtpClient'
import MessagesList from '../components/MessagesList'
import useGetMessages from '../hooks/useGetMessages'
import { getConversationKey } from '../helpers'

declare global {
  interface Window {
    aptos: any
    martian: any | undefined
  }
}

const recipientWalletAddress = '0x3F11b27F323b62B159D2642964fa27C46C841897'

export default function Chat() {
  const { isConnected } = useAccount()
  const { data: signer } = useSigner()

  const { initClient } = useInitXmtpClient()
  const client = useAppStore(state => state.client)
  const conversations = useAppStore(state => state.conversations)
  const selectedConversation = conversations.get(recipientWalletAddress)
  const setConversations = useAppStore(state => state.setConversations)
  const conversationKey = getConversationKey(selectedConversation)

  const { sendMessage } = useSendMessage(selectedConversation)
  const [endTime, setEndTime] = useState<Map<string, Date>>(new Map())

  const { convoMessages: messages, hasMore } = useGetMessages(
    conversationKey,
    endTime.get(conversationKey)
  )
  console.log('🚀 ~ file: chat.tsx:38 ~ Chat ~ messages', messages)

  useEffect(() => {
    const setup = async () => {
      if (!signer || !client) return

      const conversation = await client.conversations.newConversation(recipientWalletAddress)
      // Load all messages in the conversation
      const messages = await conversation.messages()
      console.log('🚀 ~ file: chat.tsx:51 ~ setup ~ messages', messages)

      // Send a message
      // await conversation.send('gm')
    }
    setup()
  }, [signer, client])

  const fetchNextMessages = useCallback(() => {
    if (hasMore && Array.isArray(messages) && messages.length > 0 && conversationKey) {
      const lastMsgDate = messages[messages.length - 1].sent
      const currentEndTime = endTime.get(conversationKey)
      if (!currentEndTime || lastMsgDate <= currentEndTime) {
        endTime.set(conversationKey, lastMsgDate)
        setEndTime(new Map(endTime))
      }
    }
  }, [conversationKey, hasMore, messages, endTime])

  useEffect(() => {
    const startNewConversation = async () => {
      signer && (await initClient(signer))
      console.log('client set')
    }
    startNewConversation()
  }, [isConnected, signer])

  useEffect(() => {
    const startNewConversation = async () => {
      const conversation = await client?.conversations.newConversation(recipientWalletAddress)
      if (conversation) {
        conversations.set(recipientWalletAddress, conversation)
        setConversations(new Map(conversations))
        console.log('conversation set')
      }
    }
    startNewConversation()
  }, [recipientWalletAddress, client])

  return (
    <ClientOnly>
      <>
        <p>Hello</p>
        <MessagesList
          fetchNextMessages={fetchNextMessages}
          messages={messages ?? []}
          hasMore={hasMore}
        />
        <MessageComposer onSend={sendMessage} />{' '}
      </>
    </ClientOnly>
  )
}
