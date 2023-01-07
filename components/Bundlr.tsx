import { WebBundlr } from '@bundlr-network/client'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
// @ts-ignore
import { sleep } from '@bundlr-network/client/build/common/upload'
import { providers } from 'ethers'
import fileReaderStream from 'filereader-stream'
import toast from 'react-hot-toast'
import { useSnapshot } from 'valtio'
import { useNetwork } from 'wagmi'
import FFmpegStore from '../store/valtio'

const bundlerHttpAddress = 'https://devnet.bundlr.network'
const currency = 'matic'
const rpcUrl = 'https://rpc-mumbai.maticvigil.com'
const chainId = `0x${(80001).toString(16)}`

export default function BundlrUploader() {
  const { href } = useSnapshot(FFmpegStore.state)

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
    toast(`Connected to ${bundlerHttpAddress}`)

    setAddress(bundlr?.address)
    setBundler(bundlr)
  }

  /**
   * Withdraw and Fund
   */

  const fund = async () => {
    if (bundler && fundAmount) {
      const toastId = toast.loading('Funding...')
      const value = parseInput(fundAmount)
      if (!value) return
      await bundler
        .fund(value)
        .then(async res => {
          toast.success(`Funded ${res?.target} with tx ID : ${res?.id}`, {
            id: toastId,
          })
          await getBundlrBalance()
        })
        .catch(e => {
          toast.error(`Failed to fund - ${e.data?.message || e.message}`, { id: toastId })
        })
    }
  }

  const updateFundAmount = (evt: React.BaseSyntheticEvent) => {
    setFundingAmount(evt.target.value)
  }

  const fileToStream = async () => {
    if (href === '') return

    let file = await fetch(href)
      .then(r => r.blob())
      .then(blobFile => new File([blobFile], 'VIDEO_FILE', { type: 'video/mp4' }))

    setMimeType(file.type ?? 'application/octet-stream')
    setSize(file.size ?? 0)
    setImgStream(fileReaderStream(file))
  }

  const handlePrice = async () => {
    if (size) {
      const price = await bundler?.utils.getPrice(currency as string, size)
      //@ts-ignore
      setPrice(price?.toString())
    }
  }

  const getBundlrBalance = async () => {
    address &&
      bundler!
        .getBalance(address)
        //@ts-ignore
        .then((res: BigNumber) => {
          setBalance(res.toString())
        })
  }

  const uploadFile = async () => {
    if (imgStream) {
      const toastId = toast.loading('Starting upload...')
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
          res?.status === 200 || res?.status === 201
            ? toast.success(`Successful! https://arweave.net/${res.data.id}`, {
                id: toastId,
              })
            : toast.error(`Unsuccessful! ${res?.status}`, {
                id: toastId,
              })
        })
        .catch(e => {
          toast.error(`Failed to upload - ${e}`, {
            id: toastId,
          })
        })
    }
  }

  /**
   * Effects
   */
  useEffect(() => {
    getBundlrBalance()
  }, [address, bundler])

  useEffect(() => {
    fileToStream()
  }, [href])

  useEffect(() => {
    handlePrice()
  }, [size, href, bundler])

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
    <div className="flex flex-col gap-2">
      <h4>Upload to Arweave</h4>

      <div>
        {address ? (
          'Connected'
        ) : (
          <button
            className="btn-block btn"
            onClick={async () => {
              await initBundlr()
            }}
          >
            Connect to Bundlr
          </button>
        )}
      </div>
      {balance && (
        <div>
          {toProperCase(currency)} Balance:{' '}
          {bundler?.utils.unitConverter(balance).toFixed(7, 2).toString()}{' '}
          {bundler?.currencyConfig.ticker.toLowerCase()}
        </div>
      )}
      {/* 
      <button onClick={fund}>Fund Bundlr</button>
      <input
        placeholder={`${toProperCase(currency)} Amount`}
        value={fundAmount || ''}
        onChange={updateFundAmount}
      /> */}
      <div className="input-group">
        <input
          type="text"
          placeholder={`${toProperCase(currency)} Amount`}
          value={fundAmount || ''}
          onChange={updateFundAmount}
          className="input"
        />
        <button onClick={fund} className="btn">
          Fund
        </button>
      </div>
      {/* <button onClick={withdraw}>Withdraw Balance</button>
      <input
        placeholder={`${toProperCase(currency)} Amount`}
        value={withdrawAmount || ''}
        onChange={updateWithdrawAmount}
      /> */}

      <div>
        {/* <button onClick={handleFileClick}>Select file from Device</button> */}
        {imgStream && (
          <>
            {/* <button onClick={handlePrice}>Get Price</button> */}
            {price && (
              <div>{`Cost: ${bundler?.utils
                .unitConverter(price)
                .toString()} ${bundler?.currencyConfig.ticker.toLowerCase()} `}</div>
            )}
            <button className="btn-block btn" onClick={uploadFile}>
              Upload to Bundlr
            </button>
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
    </div>
  )
}

// upload url example:
// https://arweave.net/51rQIS4MjBZBORU4EbsFALX7ER7PlMbFphYWZVhMCcE
