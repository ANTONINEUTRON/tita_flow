# TitaFlow

TitaFlow is a configurable fundraising protocol built on Solana that enables transparent, milestone-based funding with community governance. The platform solves the trust deficit in fundraising by ensuring funds are only released when project milestones are verifiably achieved.

![TitaFlow Banner](public/logo.png)

## 🚀 Key Features

- **Milestone-Based Disbursement**: Funds are released only when goals are met and verified
- **On-Chain Transparency**: Every transaction is public and verifiable on the blockchain
- **Decentralized Governance**: Enable backers to participate in fund management through on-chain voting with various voting model to suit your use case
- **Configurable Funding Flows**: Customize funding structures for various use cases
- **AI-Powered Assistance**: Intelligent guidance for creating, optimizing and promoting funding flows
- **Secure Fund Protection**: Smart contracts safeguard contributions until milestone completion

## 🌐 Usage

### Creating a Funding Flow

1. Sign in using Civic Auth
2. Select "Create Flow" from the dashboard
3. Configure your funding flow settings:
   - Basic info (title, description, goal, etc.)
   - Optional milestone configuration
   - Optional governance settings
4. Review and submit

### Contributing to a Flow

Titaflow can be quickly tried by contributing to this funding flow https://titaflow.com/flow/8b8fb172-320e-4236-a6c

1. Get the url to a flow to view details
2. Enter contribution amount and submit
3. When the creator shares and update you get notified
4. When there's a proposal you get notified

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

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, shadcn/ui
- **Blockchain**: Solana, Anchor Framework
- **Auth & Wallet Solution**: Civic Auth
- **Store:** PostgreSQL

## 📋 Prerequisites

- Node.js 18+
- Solana CLI tools
- Anchor Framework
- Rust (for smart contract development)


## 📜 License

This project is licensed under the CUSTOM License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- Website: [titaflow.com](https://www.titaflow.com)
- Twitter: [@titaflow_](https://twitter.com/titaflow_)
- Email: [info@titaflow.com](mail@info@titaflow.com)

