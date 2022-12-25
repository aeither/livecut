import Head from "next/head";
import {
  Player,
  useAsset,
  useUpdateAsset,
  useCreateAsset,
  useAssetMetrics,
} from "@livepeer/react";
import { useState, useCallback, useMemo, useContext } from "react";
import { useDropzone } from "react-dropzone";
import { AptosContext } from "./_app";
import { Types } from "aptos";
import BarLoader from "react-spinners/BarLoader";
import styles from "../styles/Home.module.css";
// import { ConnectWallet, useWeb3 } from "@fewcha/web3-react";

import {
  CreateAptosTokenBody,
  CreateAptosTokenResponse,
} from "../pages/api/create-aptos-token";
import { LivepeerProvider } from "@livepeer/react";

import ClientOnly from "../components/ClientOnly";
import { useQuery } from "@tanstack/react-query";

declare global {
  interface Window {
    aptos: any;
    martian: any | undefined;
  }
}

export default function Aptos() {
  const [address, setAddress] = useState<string | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [isCreatingNft, setIsCreatingNft] = useState(false);
  const [creationHash, setCreationHash] = useState("");
  const [isExportStarted, setIsExportedStarted] = useState(false);

  const aptosClient = useContext(AptosContext);

  const connectMartianWallet = async () => {
    const { address } = await (window as any).martian.connect();
    setAddress(address);
  };

  const disconnectMartianWallet = async () => {
    await (window as any).martian.disconnect();
    refetch();
    setAddress(null);
  };

  const { data: isConnected, refetch } = useQuery({
    queryKey: ["isConnected"],
    queryFn: async () => await window.martian.isConnected(),
  });

  // const isAptosDefined = useMemo(
  //   () => (typeof window !== "undefined" ? Boolean(window?.aptos) : false),
  //   []
  // );

  const {
    mutate: createAsset,
    data: createdAsset,
    status: createStatus,
    uploadProgress,
  } = useCreateAsset();

  const { data: asset, status: assetStatus } = useAsset<LivepeerProvider, any>({
    assetId: createdAsset?.id,
    refetchInterval: (asset) =>
      asset?.storage?.status?.phase !== "ready" ? 5000 : false,
  });

  const { mutate: updateAsset, status: updateStatus } = useUpdateAsset();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0 && acceptedFiles?.[0]) {
      setVideo(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "video/*": ["*.mp4"],
    },
    maxFiles: 1,
    onDrop,
  });

  const isLoading = useMemo(
    () =>
      createStatus === "loading" ||
      assetStatus === "loading" ||
      updateStatus === "loading" ||
      (asset && asset?.status?.phase !== "ready") ||
      (isExportStarted && asset?.status?.phase !== "success"),
    [createStatus, asset, assetStatus, updateStatus, isExportStarted]
  );

  const progressFormatted = useMemo(
    () =>
      uploadProgress
        ? `Uploading: ${Math.round(uploadProgress * 100)}%`
        : asset?.status?.progress
        ? `Processing: ${Math.round(asset?.status?.progress * 100)}%`
        : null,
    [uploadProgress, asset?.status?.progress]
  );

  // const connectWallet = useCallback(async () => {
  //   try {
  //     if (isAptosDefined) {
  //       await window.aptos.connect();
  //       const account: { address: string } = await window.aptos.account();

  //       setAddress(account.address);
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }, [isAptosDefined]);

  const mintNft = useCallback(async () => {
    setIsCreatingNft(true);
    try {
      if (address && aptosClient && asset?.storage?.ipfs?.nftMetadata?.url) {
        const body: CreateAptosTokenBody = {
          receiver: address,
          metadataUri: asset.storage.ipfs.nftMetadata.url,
        };
        console.log("🚀 ~ file: index.tsx:131 ~ mintNft ~ body", body);

        const response = await fetch("/api/create-aptos-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const json = (await response.json()) as CreateAptosTokenResponse;

        if ((json as CreateAptosTokenResponse).tokenName) {
          const createResponse = json as CreateAptosTokenResponse;

          // tokenClient?.claimToken(
          //   address,
          //   createResponse.creator,
          //   createResponse.creator,
          //   createResponse.collectionName,
          //   createResponse.tokenName,
          //   createResponse.tokenPropertyVersion
          // );

          // https://explorer.aptoslabs.com/account/0x3/modules

          const payload = {
            type: "entry_function_payload",
            function: "0x3::token_transfers::claim_script",
            arguments: [
              createResponse.creator,
              createResponse.creator,
              createResponse.collectionName,
              createResponse.tokenName,
              createResponse.tokenPropertyVersion,
            ],
            type_arguments: [],
          };

          const transaction = await window.martian.generateTransaction(
            address,
            payload
          );
          const txnHash = await window.martian.signAndSubmitTransaction(
            transaction
          );
          console.log("🚀 ~ file: index.tsx:179 ~ mintNft ~ txnHash", txnHash);

          // const aptosResponse: Types.PendingTransaction =
          //   await window.martian.signAndSubmitTransaction(transaction);

          // const result = await aptosClient.waitForTransactionWithResult(
          //   aptosResponse.hash,
          //   {
          //     checkSuccess: true,
          //   }
          // );
          // console.log("🚀 ~ file: index.tsx:174 ~ mintNft ~ result", result);

          // setCreationHash(result.hash);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreatingNft(false);
    }
  }, [
    address,
    aptosClient,
    asset?.storage?.ipfs?.nftMetadata?.url,
    setIsCreatingNft,
  ]);

  return (
    <ClientOnly>
      <div>
        <div className={styles.container}>
          <Head>
            <title>Aptos NFT Minting Sample Dapp</title>
            <meta name="description" content="Generated by create next app" />
          </Head>

          <main className={styles.main}>
            <h1 className={styles.title}>
              Welcome to <span>Aptos</span>
            </h1>

            {isConnected ? (
              <button onClick={disconnectMartianWallet}>Disconnect</button>
            ) : (
              <button onClick={connectMartianWallet}>Connect</button>
            )}

            {/* <div className={styles.connect}>
              <button
                className={styles.buttonConnect}
                disabled={!isAptosDefined || Boolean(address)}
                onClick={connectMartianWallet}
              >
                <p> {!address ? "Connect Wallet" : address}</p>
              </button>
            </div> */}

            <>
              {address && (
                <div>
                  {/* Drag/Drop file */}
                  <div className={styles.drop} {...getRootProps()}>
                    <input {...getInputProps()} />
                    <div>
                      <p>
                        Drag and drop or <span>browse files</span>
                      </p>
                    </div>
                  </div>

                  {/* Upload progress */}
                  <div className={styles.progress}>
                    {video ? (
                      <p>Name: {video.name}</p>
                    ) : (
                      <p>Select a video file to upload.</p>
                    )}
                    {progressFormatted && <p>{progressFormatted}</p>}
                  </div>

                  {/* Upload video */}

                  <div className={styles.buttonBox}>
                    {asset?.status?.phase !== "ready" ? (
                      <button
                        className={styles.button}
                        onClick={() => {
                          if (video) {
                            createAsset({ name: video.name, file: video });
                          }
                        }}
                        disabled={!video || isLoading || Boolean(asset)}
                      >
                        Upload Asset
                        <br />
                        {isLoading && <BarLoader color="#fff" />}
                      </button>
                    ) : asset?.status?.phase === "ready" &&
                      asset?.storage?.status?.phase !== "ready" ? (
                      <button
                        className={styles.button}
                        onClick={() => {
                          if (asset.id) {
                            setIsExportedStarted(true);
                            updateAsset({
                              assetId: asset.id,
                              storage: { ipfs: true },
                            });
                          }
                        }}
                        disabled={
                          !asset.id ||
                          isLoading ||
                          Boolean(asset?.storage?.ipfs?.cid)
                        }
                      >
                        Upload to IPFS
                        <br />
                        {isLoading && <BarLoader color="#fff" />}
                      </button>
                    ) : creationHash ? (
                      <p className={styles.link}>
                        <a
                          href={`https://explorer.aptoslabs.com/txn/${creationHash}?network=Devnet`}
                        >
                          View Mint Transaction
                        </a>
                      </p>
                    ) : asset?.storage?.status?.phase === "ready" ? (
                      <button className={styles.button} onClick={mintNft}>
                        Mint Video NFT
                        <br />
                        {isCreatingNft && <BarLoader color="#fff" />}
                      </button>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              )}
            </>
          </main>
        </div>
      </div>
    </ClientOnly>
  );
}
