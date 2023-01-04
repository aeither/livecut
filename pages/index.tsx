import clsx from 'clsx'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import Chat from '../components/Chat'
import ClientOnly from '../components/ClientOnly'
import Navigation from '../components/Navigation'
import Video from '../components/Video'
import VideoSettings from '../components/VideoSettings'
import useCanvas from '../hooks/useCanvas'
import FFmpegStore from '../store/valtio'

const Home: NextPage = () => {
  const { canvasRef, playOrPause, setFormattedTime, videoState, currentTime } = useCanvas()

  const { setOutputOptions } = FFmpegStore

  const [isCutVideo, setIsCutVideo] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const onUpdateRange = () => {
    console.log('isCutVideo: ', isCutVideo)
    if (isCutVideo) {
      setOutputOptions(`-ss 00:00:00 -t ${currentTime} -c:v copy -c:a copy`)
    } else {
      setOutputOptions('')
    }
  }
  useEffect(() => {
    onUpdateRange()
  }, [currentTime])

  return (
    <ClientOnly>
      <Navigation />

      <div className="grid min-h-[calc(100vh-64px-64px)] grid-cols-5 gap-4 md:px-4">
        <div className="col-span-1 row-span-5 rounded-xl bg-base-200 p-4">
          <VideoSettings />
        </div>
        <div className="col-span-3 row-span-4 rounded-xl bg-base-200 p-4">
          <h2>Video</h2>
          <div className="flex justify-center">
            <div className="flex overflow-hidden rounded-2xl">
              <canvas ref={canvasRef} width="740" height="610"></canvas>
            </div>
          </div>
        </div>
        <div className="col-span-1 row-span-4 rounded-xl bg-base-200 p-4">
          <div className="tabs tabs-boxed flex justify-around pb-2">
            {['Chat', 'Meet'].map((name, index) => (
              <a
                key={index}
                onClick={() => setActiveTab(index)}
                className={clsx('tab tab-lg', activeTab === index && 'tab-active')}
              >
                {name}
              </a>
            ))}
          </div>
          <div className={clsx('card', activeTab !== 0 && 'hidden')}>
            <Chat />
          </div>
          <div className={clsx('card', activeTab !== 1 && 'hidden')}>
            <Video />
          </div>
        </div>
        <div className="col-span-4 row-span-1 rounded-xl bg-base-200 p-4">
          <input
            type="range"
            step={0.05}
            className="range"
            min="0"
            max={String(videoState.video?.duration)}
            onChange={e => setFormattedTime(e.target.value)}
          />
          <button
            className="btn"
            onClick={() => {
              if (videoState.video && videoState.video.currentTime > 2)
                videoState.video.currentTime -= 2
            }}
          >
            Back
          </button>
          <button
            className="btn"
            onClick={() => {
              if (videoState.video) videoState.video.currentTime += 2
            }}
          >
            Forward
          </button>
          <button
            className="btn"
            onClick={() => {
              playOrPause()
            }}
          >
            Play / Pause
          </button>
          <input
            type="checkbox"
            onChange={e => setIsCutVideo(e.target.checked)}
            className="checkbox"
          />

          <p>{currentTime}</p>
        </div>
      </div>
    </ClientOnly>
  )
}

export default Home
