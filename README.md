# DGuestbook - A Decentralized Guestbook on the Blockchain

Welcome to DGuestbook, a modern, decentralized guestbook application built on the Ethereum blockchain. This project allows users to post public messages that are stored immutably on-chain and to mint their favorite messages as unique NFTs.

The frontend is built with Next.js and React, styled with the sleek **shadcn/ui** component library, and interacts with the blockchain via Wagmi and Viem. The smart contracts are developed using Solidity and Hardhat.

## ✨ Key Features

- **Wallet Integration**: Securely connect with Ethereum wallets like MetaMask using RainbowKit.
- **On-Chain Messaging**: Post messages that are permanently stored on the Sepolia testnet.
- **Message-to-NFT Minting**: Mint any message from the guestbook into a unique ERC-721 NFT, capturing the message content and an associated image on IPFS.
- **View Your NFTs**: A dedicated page to view all the DGuestbook NFTs you own.
- **Modern UI**: A clean, responsive, and user-friendly interface built with Next.js, TypeScript, and shadcn/ui.
- **Decentralized Storage**: NFT images are uploaded to IPFS via Pinata, ensuring decentralized and persistent storage.

## 🛠️ Tech Stack

- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Blockchain Interaction**: Wagmi, Viem, RainbowKit
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin Contracts
- **Decentralized Storage (for NFTs)**: IPFS / Pinata
- **Wallet**: MetaMask (or any other EIP-6963 compatible wallet)

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Yarn](https://yarnpkg.com/) or npm
- A crypto wallet like [MetaMask](https://metamask.io/)
- Sepolia testnet ETH in your wallet (can be obtained from a faucet)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd DGuestbook-feat-react
    ```

2.  **Install dependencies for both packages:**
    ```bash
    # From the root directory
    npm install
    # Or if you are inside the packages/reactApp or packages/contract directory
    npm install
    ```

3.  **Set up environment variables for the frontend:**

    Navigate to `packages/reactApp` and create a `.env.local` file. You'll need to add your WalletConnect Project ID and your Pinata API keys.

    ```bash
    # packages/reactApp/.env.local

    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="YOUR_WALLETCONNECT_PROJECT_ID"
    NEXT_PUBLIC_PINATA_API_KEY="YOUR_PINATA_API_KEY"
    NEXT_PUBLIC_PINATA_API_SECRET="YOUR_PINATA_API_SECRET"
    ```

4.  **Set up environment variables for the smart contracts:**

    Navigate to `packages/contract` and create a `.env` file. Add your Sepolia RPC URL and your private key for deployment.

    ```bash
    # packages/contract/.env

    SEPOLIA_RPC_URL="[https://sepolia.infura.io/v3/YOUR_INFURA_ID](https://sepolia.infura.io/v3/YOUR_INFURA_ID)"
    PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY"
    ```

### Running the Application

1.  **Deploy the Smart Contracts (if not already deployed):**

    Navigate to the `packages/contract` directory to deploy the contracts to the Sepolia testnet.

    ```bash
    cd packages/contract
    npx hardhat ignition deploy ignition/modules/DeployGuestBoard.ts --network sepolia
    ```
    After deployment, copy the deployed contract addresses and update the `packages/reactApp/srcs/contracts/config.ts` file.

2.  **Start the Frontend Development Server:**

    Navigate to the `packages/reactApp` directory.

    ```bash
    cd packages/reactApp
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.