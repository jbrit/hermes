# Hermes

Hermes is a cross-chain atomic swap protocol and application, enabling secure, trustless swaps between Ethereum (EVM) and Stellar using time-locked escrow contracts. The project features a modular monorepo, smart contracts for both chains, a React frontend, and developer tooling for seamless integration and deployment.

---

## Table of Contents

- [Features](#features)
- [Monorepo Structure](#monorepo-structure)
- [How It Works](#how-it-works)
- [What Happens in the `app/` Folder](#what-happens-in-the-app-folder)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Cross-chain atomic swaps** between Ethereum and Stellar
- **Time-locked escrow contracts** on both chains
- **React frontend** with wallet integrations (RainbowKit/Wagmi for Ethereum, Freighter for Stellar)
- **TypeScript-first packages** and utilities
- **Dockerized deployment** for easy setup
- **Modular monorepo** for scalable development

---

## Monorepo Structure

```
.
├── app/                # React frontend application
├── evm/                # EVM Solidity contracts and scripts (Foundry)
├── packages/           # TypeScript packages (Stellar contracts, utilities)
├── resolver/           # Cross-chain swap logic and orchestration
├── scripts/            # Automation and helper scripts
├── stellar/            # Rust-based Stellar smart contracts
├── types/              # TypeScript type definitions
├── public/             # Static assets
├── Dockerfile          # Docker build config
├── package.json        # Root dependencies and scripts
└── README.md           # Project documentation
```

---

## How It Works

Hermes enables atomic swaps between Ethereum and Stellar using a four-step process:

1. **Create Source Escrow:**  
   Deploys an escrow contract on the source chain (Ethereum or Stellar) and locks the tokens.

2. **Create Destination Escrow:**  
   Deploys a corresponding escrow contract on the destination chain and locks the tokens.

3. **Withdraw Destination Escrow:**  
   The recipient withdraws tokens from the destination escrow using a secret.

4. **Withdraw Source Escrow:**  
   The sender withdraws from the source escrow, completing the atomic swap.

All steps are coordinated by the backend logic in [`resolver/nevm.ts`](resolver/nevm.ts) and surfaced in the frontend.

---

## What Happens in the `app/` Folder

The [`app/`](app/) directory contains the frontend for Hermes, a cross-chain swap interface between Ethereum (EVM) and Stellar.

- **Wallet Connections:**  
  Users connect their Ethereum wallet (RainbowKit/Wagmi) and Stellar wallet (Freighter).
- **Balance Display:**  
  The UI fetches and displays DTK token balances on both chains.
- **Asset and Amount Selection:**  
  Users select the source/destination chain, asset, and amount.
- **Swap Initiation:**  
  The app determines swap direction, signs a message, and triggers the swap logic.
- **Swap Execution:**  
  The swap logic (see [`resolver/nevm.ts`](resolver/nevm.ts)) performs the four-step atomic swap as described above.
- **Transaction Feedback:**  
  The UI displays transaction hashes for each step, with links to Etherscan or Stellar Expert.

**Key Files:**
- [`welcome/welcome.tsx`](app/welcome/welcome.tsx): Main UI and swap logic.
- [`common.ts`](app/common.ts): Shared hooks and blockchain interaction utilities.
- [`asset-selector.tsx`](app/asset-selector.tsx): Asset dropdown component.
- [`routes/home.tsx`](app/routes/home.tsx): Home route rendering the swap UI.

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Yarn or npm
- Docker (optional, for containerized deployment)
- Foundry (for EVM contracts)
- Rust toolchain (for Stellar contracts)

### Installation

```sh
npm install
```

### Development

Start the React app with hot module replacement:

```sh
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```sh
npm run build
```

---

## Environment Variables

The project uses a `.env` file for configuration. Example:

```dotenv
STELLAR_PRIVATE_KEY=...
ETH_PRIVATE_KEY=...
ETHERSCAN_API_KEY=...
SEPOLIA_RPC=...
ACCESS_TOKEN=...
ETH_FACTORY_ADDRESS=...
STELLAR_FACTORY_ADDRESS=...
ETH_DUMMY_TOKEN=...

VITE_STELLAR_PRIVATE_KEY=...
VITE_ETH_PRIVATE_KEY=...
VITE_ETHERSCAN_API_KEY=...
VITE_SEPOLIA_RPC=...
VITE_ACCESS_TOKEN=...
VITE_ETH_FACTORY_ADDRESS=...
VITE_STELLAR_FACTORY_ADDRESS=...
VITE_ETH_DUMMY_TOKEN=...
```

**Note:** Never commit real private keys to version control.

---

## Testing

- **Frontend:**  
  Run tests with your preferred React testing setup.
- **EVM Contracts:**  
  ```sh
  cd evm
  forge test
  ```
- **Stellar Contracts:**  
  Use the Rust toolchain and Soroban CLI for building and testing.

---

## Docker Deployment

Build and run the app in Docker:

```sh
docker build -t hermes-app .
docker run -p 3000:3000 hermes-app
```

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## License

MIT

---

Built with ❤️ by the Hermes team.