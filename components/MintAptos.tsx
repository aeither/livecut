import { LivepeerProvider, useAsset, useCreateAsset, useUpdateAsset } from '@livepeer/react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useCallback, useContext, useMemo, useState } from 'react'
import { CreateAptosTokenBody, CreateAptosTokenResponse } from '../pages/api/create-aptos-token'
import { AptosContext } from '../pages/_app'
import styles from '../styles/Home.module.css'

declare global {
  interface Window {
    aptos: any
    martian: any | undefined
  }
}

export default function MintAptos({ video }: { video: File | undefined }) {
  const [address, setAddress] = useState<string | null>(null)
  //   const [video, setVideo] = useState<File | null>(null)
  const [isCreatingNft, setIsCreatingNft] = useState(false)
  const [creationHash, setCreationHash] = useState('')
  const [isExportStarted, setIsExportedStarted] = useState(false)

  const aptosClient = useContext(AptosContext)

  const connectMartianWallet = async () => {
    const { address } = await (window as any).martian.connect()
    setAddress(address)
  }

  const disconnectMartianWallet = async () => {
    await (window as any).martian.disconnect()
    refetch()
    setAddress(null)
  }

  const { data: isConnected, refetch } = useQuery({
    queryKey: ['isConnected'],
    queryFn: async () => await window.martian.isConnected(),
  })

  const {
    mutate: createAsset,
    data: createdAsset,
    status: createStatus,
    uploadProgress,
  } = useCreateAsset()

  const { data: asset, status: assetStatus } = useAsset<LivepeerProvider, any>({
    assetId: createdAsset?.id,
    refetchInterval: asset => (asset?.storage?.status?.phase !== 'ready' ? 5000 : false),
  })

  const { mutate: updateAsset, status: updateStatus } = useUpdateAsset()

  const isLoading = useMemo(
    () =>
      createStatus === 'loading' ||
      assetStatus === 'loading' ||
      updateStatus === 'loading' ||
      (asset && asset?.status?.phase !== 'ready') ||
      (isExportStarted && asset?.status?.phase !== 'success'),
    [createStatus, asset, assetStatus, updateStatus, isExportStarted]
  )

  const progressFormatted = useMemo(
    () =>
      uploadProgress
        ? `Uploading: ${Math.round(uploadProgress * 100)}%`
        : asset?.status?.progress
        ? `Processing: ${Math.round(asset?.status?.progress * 100)}%`
        : null,
    [uploadProgress, asset?.status?.progress]
  )

  const mintNft = useCallback(async () => {
    setIsCreatingNft(true)
    try {
      if (address && aptosClient && asset?.storage?.ipfs?.nftMetadata?.url) {
        const body: CreateAptosTokenBody = {
          receiver: address,
          metadataUri: asset.storage.ipfs.nftMetadata.url,
        }

        const response = await fetch('/api/create-aptos-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        const json = (await response.json()) as CreateAptosTokenResponse

        if ((json as CreateAptosTokenResponse).tokenName) {
          const createResponse = json as CreateAptosTokenResponse

          const payload = {
            type: 'entry_function_payload',
            function: '0x3::token_transfers::claim_script',
            arguments: [
              createResponse.creator,
              createResponse.creator,
              createResponse.collectionName,
              createResponse.tokenName,
              createResponse.tokenPropertyVersion,
            ],
            type_arguments: [],
          }

          const transaction = await window.martian.generateTransaction(address, payload)
          const txnHash = await window.martian.signAndSubmitTransaction(transaction)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsCreatingNft(false)
    }
  }, [address, aptosClient, asset?.storage?.ipfs?.nftMetadata?.url, setIsCreatingNft])

  return (
    <div>
      {address ? (
        <button className="btn-error btn-block btn" onClick={disconnectMartianWallet}>
          Disconnect Aptos
        </button>
      ) : (
        <button className="btn-block btn" onClick={connectMartianWallet}>
          Connect Aptos
        </button>
      )}

      {address && (
        <div>
          <div className="w-full">
            {asset?.status?.phase !== 'ready' ? (
              <button
                className={clsx('btn-block btn', isLoading && 'loading')}
                onClick={() => {
                  if (video) {
                    createAsset({ name: video.name, file: video })
                  }
                }}
                disabled={!video || isLoading || Boolean(asset)}
              >
                Upload Asset
              </button>
            ) : asset?.status?.phase === 'ready' && asset?.storage?.status?.phase !== 'ready' ? (
              <button
                className={clsx('btn-block btn', isLoading && 'loading')}
                onClick={() => {
                  if (asset.id) {
                    setIsExportedStarted(true)
                    updateAsset({
                      assetId: asset.id,
                      storage: { ipfs: true },
                    })
                  }
                }}
                disabled={!asset.id || isLoading || Boolean(asset?.storage?.ipfs?.cid)}
              >
                Upload to IPFS
              </button>
            ) : creationHash ? (
              <p className={styles.link}>
                <a href={`https://explorer.aptoslabs.com/txn/${creationHash}?network=Devnet`}>
                  View Mint Transaction
                </a>
              </p>
            ) : asset?.storage?.status?.phase === 'ready' ? (
              <button
                className={clsx('btn-block btn', isCreatingNft && 'loading')}
                onClick={mintNft}
              >
                Mint Video NFT
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
