import { classNames, shortAddress } from '../helpers'

type AddressProps = {
  address: string
  className?: string
}

const Address = ({ address, className }: AddressProps): JSX.Element => {
  return (
    <span className={classNames(className || '', 'font-mono')} title={address}>
      {shortAddress(address)}
    </span>
  )
}

export default Address
