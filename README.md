# TitaFlow

TitaFlow is a configurable fundraising protocol built on Solana that enables transparent, milestone-based funding with community governance. The platform solves the trust deficit in crowdfunding by ensuring funds are only released when project milestones are verifiably achieved.

![TitaFlow Banner](public/logo.png)

## 🚀 Key Features

- **Milestone-Based Disbursement**: Funds are released only when goals are met and verified
- **On-Chain Transparency**: Every transaction is public and verifiable on the blockchain
- **Decentralized Governance**: Enable backers to participate in fund management through on-chain voting
- **Configurable Funding Flows**: Customize funding structures for various use cases
- **Secure Fund Protection**: Smart contracts safeguard contributions until milestone completion

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, shadcn/ui
- **Blockchain**: Solana, Anchor Framework
- **Auth Solution**: Civic Auth

## 📋 Prerequisites

- Node.js 18+
- Solana CLI tools
- Anchor Framework
- Rust (for smart contract development)

## 🔧 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/antonineutron/tita-flow.git
cd tita-flow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run the Development Server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🌐 Usage

### Creating a Funding Flow

1. Connect your wallet using Civic Auth
2. Select "Create Flow" from the dashboard
3. Configure your funding flow settings:
   - Basic info (title, description, goal, etc.)
   - Optional milestone configuration
   - Optional governance settings
4. Review and submit

### Contributing to a Flow

1. Get the url to a flow to view details
2. Enter contribution amount and submit

### Governance

Project stakeholders can:
- Create proposals for milestone completion
- Vote on proposals based on the configured voting model
- Track proposal status and execution

## 🏗️ Architecture

TitaFlow consists of:

1. **Smart Contracts**: Anchor programs that handle fund escrow, milestone verification, and governance
2. **Next.js Frontend**: User interface for interacting with the protocol
3. **Supabase Database**: Stores flow metadata, user profiles, and contribution history

## 🤝 Contributing

We welcome contributions to TitaFlow! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## 📜 License

This project is licensed under the CUSTOM License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- Website: [titaflow.setita.com](https://titaflow.setita.com)
- Twitter: [@titaflow_](https://twitter.com/titaflow_)

