import { ConnectKitButton } from 'connectkit'
import NextLink from 'next/link'
import { useSnapshot } from 'valtio'
import FFmpegStore from '../store/valtio'
import { UserIcon } from './Icons/VideoIcons'

const Navigation = () => {
  const { progress } = useSnapshot(FFmpegStore.state)

  return (
    <div className="navbar bg-base-100 p-0">
      <div className="navbar-start pl-4">
        <div className="w-32">
          <img src="/images/livecut-logo-text-transparent.png" width="100%" alt="" />
        </div>
        {/* <a className="btn-ghost btn text-xl normal-case">Livecut</a> */}
      </div>
      <div className="navbar-center hidden lg:flex">
        <progress className="progress progress-success w-72" value={progress} max="100"></progress>
      </div>
      <div className="navbar-end pr-4">
        <NextLink href={'/profile'}>
          <a className="btn-circle btn mr-4 no-underline">
            <UserIcon />
          </a>
        </NextLink>
        <ConnectKitButton />
      </div>
    </div>
  )
}

export default Navigation
