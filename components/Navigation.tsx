import { ConnectKitButton } from 'connectkit'
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'
import ClientOnly from '../components/ClientOnly'
import NextLink from 'next/link'
import { UserIcon } from './Icons/VideoIcons'

const Navigation = () => {
  const { address, isConnecting, isDisconnected } = useAccount()

  const { data: name } = useEnsName({
    address: address,
  })
  const { data: avatar } = useEnsAvatar({
    address: address,
  })

  return (
    <div className="navbar bg-base-100 p-0">
      <div className="navbar-start pl-4">
        <div className="w-32">
          <img src="/images/livecut-logo-text-transparent.png" width="100%" alt="" />
        </div>
        {/* <a className="btn-ghost btn text-xl normal-case">Livecut</a> */}
      </div>
      <div className="navbar-center hidden lg:flex">
        <progress className="progress progress-success w-72"></progress>
      </div>
      <div className="navbar-end pr-4">
        <NextLink href={'/profile'}>
          <a className="btn-circle btn no-underline mr-4">
            <UserIcon />
          </a>
        </NextLink>
        <ConnectKitButton />
      </div>
    </div>
  )
}

export default Navigation
