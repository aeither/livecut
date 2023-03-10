import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

type MessageComposerProps = {
  onSend: (msg: string) => Promise<void>
}

const MessageComposer = ({ onSend }: MessageComposerProps): JSX.Element => {
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => setMessage(''), [router.query.recipientWalletAddr])

  const onMessageChange = (e: React.FormEvent<HTMLInputElement>) =>
    setMessage(e.currentTarget.value)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message) {
      return
    }
    setMessage('')
    await onSend(message)
  }

  return (
    <div className={''}>
      <form className="flex flex-col pt-8" autoComplete="off" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Say hi..."
          className="input"
          name="message"
          value={message}
          onChange={onMessageChange}
          required
        />
        <button className="btn" type="submit">
          {!message ? 'Write' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default MessageComposer
