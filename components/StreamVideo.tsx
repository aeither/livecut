import { useHuddleStore } from '@huddle01/huddle01-client/store'
import React, { useEffect, useRef } from 'react'

const StreamVideo = () => {
  const stream = useHuddleStore(state => state.stream)
  const isCamPaused = useHuddleStore(state => state.isCamPaused)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
    console.log({ stream })
  }, [stream])
  return <video style={{ width: '100%' }} ref={videoRef} autoPlay muted playsInline></video>
}

export default StreamVideo
