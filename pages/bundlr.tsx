import { WebBundlr } from '@bundlr-network/client'
import BigNumber from 'bignumber.js'
import { ConnectKitButton } from 'connectkit'
import { useState } from 'react'
import ClientOnly from '../components/ClientOnly'
// @ts-ignore
import { sleep } from '@bundlr-network/client/build/common/upload'
import { ethers, providers } from 'ethers'
import fileReaderStream from 'filereader-stream'
import { useNetwork } from 'wagmi'

const bundlerHttpAddress = 'https://devnet.bundlr.network'
const currency = 'matic'
const rpcUrl = 'https://rpc-mumbai.maticvigil.com'
const chainId = `0x${(80001).toString(16)}`

export default function Chat() {
  const { chain } = useNetwork()

  // bundlr client and address
  const [address, setAddress] = useState<string>()
  const [bundler, setBundler] = useState<WebBundlr>()

  // amount on bundlr network and fund/withdraw
  const [balance, setBalance] = useState<string>()
  const [fundAmount, setFundingAmount] = useState<string>()
  const [withdrawAmount, setWithdrawAmount] = useState<string>()

  // uploaded img
  const [mimeType, setMimeType] = useState<string>()
  const [size, setSize] = useState<number>()
  const [imgStream, setImgStream] = useState<ReadableStream>()

  // storage fee
  const [price, setPrice] = useState<BigNumber>()

  // upload asset
  const [totalUploaded, setTotalUploaded] = useState<number>(0)
  const [lastUploadId, setLastUploadId] = useState<string>()

  /**
   * Initiate Client
   */

  const initBundlr = async () => {
    if (!window?.ethereum?.isMetaMask) return

    console.log('currency: ', currency)
    console.log('rpcUrl: ', rpcUrl)

    const provider = new providers.Web3Provider(window.ethereum as any)

    if (chain?.id !== Number(chainId)) {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      })
    }

    const bundlr = new WebBundlr(bundlerHttpAddress, currency, provider, {
      providerUrl: rpcUrl,
      // contractAddress,
    })

    try {
      // Check for valid bundlr node
      await bundlr.utils.getBundlerAddress(currency)
    } catch {
      alert(`Failed to connect to bundlr ${bundlerHttpAddress}`)
      return
    }

    try {
      await bundlr.ready()
    } catch (err) {
      console.log(err)
    } //@ts-ignore
    if (!bundlr.address) {
      console.log('something went wrong')
    }
    alert(`Connected to ${bundlerHttpAddress}`)
    setAddress(bundlr?.address)
    setBundler(bundlr)
  }

  /**
   * Withdraw and Fund
   */

  const fund = async () => {
    if (bundler && fundAmount) {
      alert('Funding...')
      const value = parseInput(fundAmount)
      if (!value) return
      await bundler
        .fund(value)
        .then(res => {
          alert(`Funded ${res?.target} with tx ID : ${res?.id}`)
        })
        .catch(e => {
          alert(`Failed to fund - ${e.data?.message || e.message}`)
        })
    }
  }

  const updateFundAmount = (evt: React.BaseSyntheticEvent) => {
    setFundingAmount(evt.target.value)
  }

  const withdraw = async () => {
    if (bundler && withdrawAmount) {
      alert('Withdrawing..')
      const value = parseInput(withdrawAmount)
      if (!value) return
      await bundler
        .withdrawBalance(value)
        .then(data => {
          alert(`Withdrawal successful - ${data?.tx_id}`)
        })
        .catch((err: any) => {
          alert('Withdrawal Unsuccessful!')
        })
    }
  }

  const updateWithdrawAmount = (evt: React.BaseSyntheticEvent) => {
    setWithdrawAmount(evt.target.value)
  }

  /**
   * Handlers
   */

  const handleFileClick = () => {
    var fileInputEl = document.createElement('input')
    fileInputEl.type = 'file'
    fileInputEl.accept = '*'
    fileInputEl.style.display = 'none'
    document.body.appendChild(fileInputEl)
    fileInputEl.addEventListener('input', function (e) {
      handleUpload(e as any)
      document.body.removeChild(fileInputEl)
    })
    fileInputEl.click()
  }

  const handleUpload = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    let files = evt.target.files
    if (files?.length !== 1) {
      throw new Error(`Invalid number of files (expected 1, got ${files?.length})`)
    }
    setMimeType(files[0]?.type ?? 'application/octet-stream')
    setSize(files[0]?.size ?? 0)
    setImgStream(fileReaderStream(files[0]))
  }

  const handlePrice = async () => {
    if (size) {
      const price = await bundler?.utils.getPrice(currency as string, size)
      //@ts-ignore
      setPrice(price?.toString())
    }
  }

  const uploadFile = async () => {
    if (imgStream) {
      alert('Starting upload...')
      setTotalUploaded(0)
      setLastUploadId(undefined)
      await sleep(2_000) // sleep as this is all main thread (TODO: move to web worker?)
      const uploader = bundler?.uploader.chunkedUploader
      uploader?.setBatchSize(2)
      uploader?.setChunkSize(2_000_000)
      uploader?.on('chunkUpload', e => {
        // alert({
        //   status: "info",
        //   title: "Upload progress",
        //   description: `${((e.totalUploaded / ((size ?? 0))) * 100).toFixed()}%`
        // });
        setTotalUploaded(e.totalUploaded)
      })
      uploader
        //@ts-ignore
        ?.uploadData(imgStream, {
          tags: [
            {
              name: 'Content-Type',
              value: mimeType ?? 'application/octet-stream',
            },
          ],
        })
        .then(res => {
          setLastUploadId(res.data.id)
          alert(
            res?.status === 200 || res?.status === 201
              ? `Successful! https://arweave.net/${res.data.id}`
              : `Unsuccessful! ${res?.status}`
          )
        })
        .catch(e => {
          alert(`Failed to upload - ${e}`)
        })
    }
  }

  /**
   * Helpers
   */

  // parse decimal input into atomic units
  const parseInput = (input: string | number) => {
    const conv = new BigNumber(input).multipliedBy(bundler!.currencyConfig.base[1])
    if (conv.isLessThan(1)) {
      alert(`Value too small!`)
      return
    }
    return conv
  }

  const toProperCase = (s: string) => {
    return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()
  }

  return (
    <ClientOnly>
      <ConnectKitButton />
      <div>Hello</div>
      <button
        onClick={async () => {
          await initBundlr()
        }}
      >
        Connect to Bundlr
      </button>
      <div>Bundlr address: {address ? address : 'connect to show'}</div>
      <button
        onClick={async () => {
          address &&
            bundler!
              .getBalance(address)
              //@ts-ignore
              .then((res: BigNumber) => {
                setBalance(res.toString())
              })
        }}
      >
        Get Matic Balance on Bundlr
      </button>
      {balance && (
        <div>
          {toProperCase(currency)} Balance:{' '}
          {bundler?.utils.unitConverter(balance).toFixed(7, 2).toString()}{' '}
          {bundler?.currencyConfig.ticker.toLowerCase()}
        </div>
      )}

      <button onClick={fund}>Fund Bundlr</button>
      <input
        placeholder={`${toProperCase(currency)} Amount`}
        value={fundAmount || ''}
        onChange={updateFundAmount}
      />
      <button onClick={withdraw}>Withdraw Balance</button>
      <input
        placeholder={`${toProperCase(currency)} Amount`}
        value={withdrawAmount || ''}
        onChange={updateWithdrawAmount}
      />

      <div>
        <button onClick={handleFileClick}>Select file from Device</button>
        {imgStream && (
          <>
            <button onClick={handlePrice}>Get Price</button>
            {price && (
              <div>{`Cost: ${bundler?.utils
                .unitConverter(price)
                .toString()} ${bundler?.currencyConfig.ticker.toLowerCase()} `}</div>
            )}
            <button onClick={uploadFile}>Upload to Bundlr</button>
          </>
        )}
      </div>

      {totalUploaded &&
        (lastUploadId ? (
          <a
            href={`https://arweave.net/${lastUploadId}`}
            target="_blank"
            rel="noreferrer"
          >{`Done! https://arweave.net/${lastUploadId}`}</a>
        ) : (
          <>
            <p>Upload progress: {((totalUploaded / (size ?? 0)) * 100).toFixed()}%</p>
          </>
        ))}
    </ClientOnly>
  )
}

// upload url example:
// https://arweave.net/51rQIS4MjBZBORU4EbsFALX7ER7PlMbFphYWZVhMCcE
