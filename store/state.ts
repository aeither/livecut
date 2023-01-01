import { proxy } from 'valtio'
import { Client, Conversation, DecodedMessage } from '@xmtp/xmtp-js'
import getUniqueMessages from '../utils/getUniqueMessages'

/**
 * Types
 */
interface State {
  client: Client | undefined | null
  conversations: Map<string, Conversation>
  loadingConversations: boolean
  convoMessages: Map<string, DecodedMessage[]>
  previewMessages: Map<string, DecodedMessage>
}

/**
 * State
 */
const state = proxy<State>({
  conversations: new Map(),
  client: undefined,
  loadingConversations: false,
  convoMessages: new Map(),
  previewMessages: new Map(),
})

/**
 * Store / Actions
 */
const SettingsStore = {
  state,

  setClient: (client: Client | undefined | null) => {
    state.client = client
  },

  setConversations: (conversations: Map<string, Conversation>) => {
    state.conversations = conversations
  },

  setLoadingConversations: (loadingConversations: boolean) => {
    state.loadingConversations = loadingConversations
  },

  setPreviewMessage: (key: string, message: DecodedMessage) => {
    const newPreviewMessages = new Map(state.previewMessages)
    newPreviewMessages.set(key, message)
    state.previewMessages = newPreviewMessages
  },

  setPreviewMessages: (previewMessages: Map<string, DecodedMessage>) => {
    state.previewMessages = previewMessages
  },

  addMessages: (key: string, newMessages: DecodedMessage[]) => {
    let numAdded = 0

    const convoMessages = new Map(state.convoMessages)
    const existing = state.convoMessages.get(key) || []
    const updated = getUniqueMessages([...existing, ...newMessages])
    numAdded = updated.length - existing.length
    // If nothing has been added, return the old item to avoid unnecessary refresh
    if (!numAdded) {
      state.convoMessages = convoMessages
    } else {
      convoMessages.set(key, updated)
      state.convoMessages = convoMessages
    }

    return numAdded
  },
  reset: () => {
    state.client = undefined
    state.conversations = new Map()
    state.convoMessages = new Map()
    state.previewMessages = new Map()
  },
}

export default SettingsStore
