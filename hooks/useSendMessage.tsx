import { Conversation } from '@xmtp/xmtp-js'
import { useCallback } from 'react'
import { getConversationKey } from '../helpers'
import useGetMessages from './useGetMessages'

const useSendMessage = (selectedConversation?: Conversation) => {
  const conversationKey = getConversationKey(selectedConversation)

  const { loadMessages } = useGetMessages(conversationKey, new Date())

  const sendMessage = useCallback(
    async (message: string) => {
      const res = await selectedConversation?.send(message)
      console.log('message sent: ', res)
      await loadMessages()
    },
    [selectedConversation]
  )

  return {
    sendMessage,
  }
}

export default useSendMessage
