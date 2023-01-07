# Livecut
Web-based Video Editor that exports to Web3.

![README-BANNER-LIVECUT](https://user-images.githubusercontent.com/36173828/211163606-b46d4738-dc7f-4825-b059-0e3f234f8045.png)

## DEMO

[VIDEO DEMO](PLACEHOLDER)

[APP](https://livecut.vercel.app/)

## Overview  

Livecut allows users to edit and collaborate on videos from within their browser. With the ability to export finished projects to decentralized storages such as IPFS or Arweave. Additionally, users have the option to mint Video NFTs on Polygon and Aptos.

## Requirements

- Metamask with Goerli and Mumbai https://chainlist.org/
- Testnet eth https://mumbaifaucet.com/
- Martian Wallet for minting NFT to Aptos

## Project Setup

 🛠 Install the depencencies

```sh
npm install
```

🏃 Run the project

```sh
npm run dev
```

- 🛠 Setup the environment variable

  - 🤫 In the root directory of the project, create a file and name it `.env`, remember to also add it to your `.gitignore`

  - 📝 Inside this file place your Livepeer API and APTOS private key from your wallet

   `NEXT_PUBLIC_LIVEPEER_API="64xxxxxxx-xxx-xxx-xxxx-xxxxxxxxxc4"`
   `APTOS_PRIVATE_KEY="0xxxxxxxxxxxxxxxxxxxxxxxxxxx"`
   `NEXT_PUBLIC_HUDDLE_KEY="af6xxxxxxxxxxxxxxxxxxxxxxxxxxx"`

## Tech Stack and libraries

- NextJS, React, Typescript, TailwindCSS.
- Martian Wallet, aptos, livepeerJS SDK, XMTP, huddle01, ENS, FFmpeg, DaisyUI, Wagmi, Bundlr.

## Roadmap  

- [ ] Multi-tenant
- [ ] More editing features
- [ ] Improve UX and performance
