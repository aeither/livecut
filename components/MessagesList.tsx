import { DecodedMessage } from '@xmtp/xmtp-js'
import React, { FC } from 'react'
import Emoji from 'react-emoji-render'
// import Avatar from '../Avatar'
import AddressPill from './AddressPill'
import InfiniteScroll from 'react-infinite-scroll-component'
import useWindowSize from '../hooks/useWindowSize'
import { formatTime, shortAddress } from '../helpers'
import { useAccount } from 'wagmi'
import clsx from 'clsx'

export type MessageListProps = {
  messages: DecodedMessage[]
  fetchNextMessages: () => void
  hasMore: boolean
}

type MessageTileProps = {
  message: DecodedMessage
  address: `0x${string}` | undefined
}

const isOnSameDay: any = (d1?: Date, d2?: Date): boolean => {
  return d1?.toDateString() === d2?.toDateString()
}

const formatDate = (d?: Date) =>
  d?.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

// const MessageTile = ({ message }: MessageTileProps): JSX.Element => (
//   <div className="flex items-start mx-auto mb-4">
//     {/* <Avatar peerAddress={message.senderAddress as string} /> */}
//     <div className="ml-2 max-w-[95%]">
//       <div>
//         <AddressPill address={message.senderAddress as string} />
//         <span className="text-sm font-normal place-self-end text-n-300 text-md uppercase">
//           {formatTime(message.sent)}
//         </span>
//       </div>
//       <span className="block text-md px-2 mt-2 text-black font-normal break-words">
//         {message.error ? (
//           `Error: ${message.error?.message}`
//         ) : (
//           <Emoji text={message.content || ''} />
//         )}
//       </span>
//     </div>
//   </div>
// )

const MessageTile = ({ message, address }: MessageTileProps): JSX.Element => (
  <div className={clsx('chat', address === message.senderAddress ? 'chat-end' : 'chat-start')}>
    <div className="chat-image avatar">
      <div className="w-10 rounded-full">
        <img src="https://placeimg.com/192/192/people" />
      </div>
    </div>
    <div className="chat-header">
      {shortAddress(message.senderAddress as string)}
      <time className="text-xs opacity-50">{formatTime(message.sent)}</time>
    </div>
    <div className="chat-bubble">{message.content || ''}</div>
  </div>
)

const DateDividerBorder: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>
    <div className="h-0.5 grow bg-gray-300/25" />
    {children}
    <div className="h-0.5 grow bg-gray-300/25" />
  </>
)

const DateDivider = ({ date }: { date?: Date }): JSX.Element => (
  <div className="align-items-center flex items-center pb-8 pt-4">
    <DateDividerBorder>
      <span className="mx-11 flex-none text-sm font-bold text-gray-300">{formatDate(date)}</span>
    </DateDividerBorder>
  </div>
)

const ConversationBeginningNotice = (): JSX.Element => (
  <div className="align-items-center mt-4 flex justify-center pb-4">
    <span className="text-sm font-semibold text-gray-300">
      This is the beginning of the conversation
    </span>
  </div>
)

const LoadingMore: FC = () => (
  <div className="mt-6 p-1 text-center text-sm font-bold text-gray-300">Loading Messages...</div>
)

const MessagesList = ({ messages, fetchNextMessages, hasMore }: MessageListProps): JSX.Element => {
  let lastMessageDate: Date | undefined
  const size = useWindowSize()
  const { address } = useAccount()

  return (
    <InfiniteScroll
      dataLength={messages.length}
      next={fetchNextMessages}
      className="flex flex-col-reverse overflow-y-auto pl-4"
      height={size[1] > 700 ? '87vh' : '83vh'}
      inverse
      endMessage={<ConversationBeginningNotice />}
      hasMore={hasMore}
      loader={<LoadingMore />}
    >
      {messages?.map((msg: DecodedMessage, index: number) => {
        const dateHasChanged = lastMessageDate ? !isOnSameDay(lastMessageDate, msg.sent) : false
        const messageDiv = (
          <div key={`${msg.id}_${index}`}>
            <MessageTile message={msg} address={address} />
            {dateHasChanged ? <DateDivider date={lastMessageDate} /> : null}
          </div>
        )
        lastMessageDate = msg.sent
        return messageDiv
      })}
    </InfiniteScroll>
  )
}

export default React.memo(MessagesList)
