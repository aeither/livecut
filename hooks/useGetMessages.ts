import { SortDirection } from '@xmtp/xmtp-js'
import { useCallback, useEffect, useState } from 'react'
import { MESSAGE_LIMIT } from '../helpers/constants'
import { useAppStore } from '../store/state'

const useGetMessages = (conversationKey: string, endTime?: Date) => {
  const convoMessages = useAppStore(state => state.convoMessages.get(conversationKey))
  const conversation = useAppStore(state => state.conversations.get(conversationKey))
  const addMessages = useAppStore(state => state.addMessages)
  const [hasMore, setHasMore] = useState<Map<string, boolean>>(new Map())

  const loadMessages = useCallback(async () => {
    if (!conversation) {
      return
    }

    const newMessages = await conversation.messages({
      direction: SortDirection.SORT_DIRECTION_DESCENDING,
      limit: MESSAGE_LIMIT,
      // endTime: endTime,
    })
    console.log('🚀 ~ file: useGetMessages.ts:23 ~ loadMessages ~ newMessages', newMessages)
    if (newMessages.length > 0) {
      addMessages(conversationKey, newMessages)
      if (newMessages.length < MESSAGE_LIMIT) {
        hasMore.set(conversationKey, false)
        setHasMore(new Map(hasMore))
      } else {
        hasMore.set(conversationKey, true)
        setHasMore(new Map(hasMore))
      }
    } else {
      hasMore.set(conversationKey, false)
      setHasMore(new Map(hasMore))
    }
  }, [conversation, conversationKey]) // endTime]) // pooling

  useEffect(() => {
    loadMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMessages])

  return {
    convoMessages,
    loadMessages,
    hasMore: hasMore.get(conversationKey) ?? false,
  }
}

export default useGetMessages
