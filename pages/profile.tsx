import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'
import ClientOnly from '../components/ClientOnly'

export default function Profile() {
  const { address } = useAccount()

  const { data: name } = useEnsName({
    address: address,
  })
  const { data: avatar } = useEnsAvatar({
    address: address,
  })

  return (
    <ClientOnly>
      <>
        <div className="flex h-screen items-center justify-center">
          <div className="card w-96 bg-neutral text-neutral-content">
            <div className="card-body items-center text-center">
              <h2 className="card-title">ENS Name: {name}</h2>
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                  <img src={avatar || ''} width="50px" alt="avatar" />
                </div>
              </div>

              <p>Edit. Share. Mint.</p>
              <div className="card-actions justify-end">
                <button className="btn-primary btn">Edit</button>
                <button className="btn-ghost btn">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </>
    </ClientOnly>
  )
}
