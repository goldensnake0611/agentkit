<div align="center">
  <p>
    <a href="https://docs.0xgasless.com/docs">
      <img src="./repo-banner.png" alt="0xGasless AgentKit" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
    </a>
  </p>
  <h1 style="font-size: 3em; margin-bottom: 20px;">
    0xGasless AgentKit
  </h1>
  <p style="font-size: 1.2em; max-width: 600px; margin: 0 auto 20px;">
    0xGasless AgentKit lets you build AI agents that can trade, manage funds, and interact with DeFi protocols in natural language.
  </p>
</div>

<div>
  <img src="https://img.shields.io/npm/dm/@0xgasless/agentkit" alt="NPM Downloads">
  <img src="https://img.shields.io/github/license/0xgasless/agentkit" alt="GitHub License">
</div>

<div>
  <img src="https://img.shields.io/badge/v20.12.2-1?label=typescript&color=blue" alt="Typescript Version">
  <img src="https://img.shields.io/pypi/pyversions/0xgasless-agentkit" alt="PyPI - Python Version">
</div>

## Table of Contents
- [🚀 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [📚 Examples](#-examples)
- [🏗️ Repository Structure](#️-repository-structure)
- [💻 Contributing](#-contributing)
- [📖 Documentation](#-documentation)
- [🔒 Security](#-security)
- [📄 License](#-license)

# 🚀 Overview
0xGasless AgentKit is a powerful toolkit for building AI agents that can interact with blockchain networks and DeFi protocols. It enables gasless transactions and account abstraction on EVM chains, making it easier to create sophisticated blockchain applications.

**Create agents that can:**
- Execute gasless transactions without holding native tokens
- Transfer and trade tokens
- Deploy smart contracts
- Interact with DeFi protocols
- Get wallet details and balances
- Create and manage smart accounts

**How it works**

0xGasless AgentKit leverages ERC-4337 account abstraction to enable gasless transactions:
1. Configure your agent with a wallet
2. Use the built-in tools for blockchain interactions
3. Execute transactions without requiring native tokens for gas
4. Integrate with any AI framework of your choice

# ✨ Key Features

- **Framework-agnostic**: Common AI Agent primitives that can be used with any AI framework
- **Python and Node.js Support**: Full support for both Python and TypeScript
- **Gasless Transactions**: Execute transactions without holding native tokens
- **Account Abstraction**: Built on ERC-4337 standard
- **Multi-Chain Support**: Works across major EVM chains:
  - BSC (56)
  - Avalanche (43114)
  - Base (8453)
  - Sonic (146)
  - Moonbeam (1284)

**Supported Onchain Actions:**
- Getting wallet details and balances
- Transferring and trading tokens
- Coming Soon:
  - Deploying ERC-20 tokens
  - Deploying ERC-721 tokens and minting NFTs
  - Buying and selling Dex Swap ERC-20 coins
  - Wrapping ETH to WETH on Base

# 📚 Examples

Check out [agentkit-langchain/examples](./agentkit-demo/index.ts) for inspiration and help getting started!
- [Chatbot Typescript](./agentkit-demo/index.ts): Simple example of a Node.js Chatbot that can perform complex onchain interactions, using OpenAI.

# 🏗️ Repository Structure

AgentKit is organized as a [monorepo](https://en.wikipedia.org/wiki/Monorepo) that contains multiple packages:

```
./
├── agentkit-core/
│   └── typescript/
│       ├── BaseActions/
│       │   ├── SendTransaction.ts
│       │   ├── SignMessage.ts
│       │   ├── EncodeFunctionData.ts
│       │   ├── FormatHelpers.ts
│       │   ├── GetBalance.ts
│       │   ├── GetStatusFromUserop.ts
│       │   └── ReadContract.ts
│       └── Actions/
├── agentkit-demo/
│   ├── typescript/
│   └── examples/
```

## Base Actions

| Action | Description | File |
|--------|-------------|------|
| SendTransaction | Execute blockchain transactions | [SendTransaction.ts](./agentkit-core/src/BaseActions/SendTransaction.ts) |
| SignMessage | Sign messages for authentication | [SignMessage.ts](./agentkit-core/src/BaseActions/SignMessage.ts) |
| EncodeFunctionData | Encode function calls for smart contracts | [EncodeFunctionData.ts](./agentkit-core/src/BaseActions/EncodeFunctionData.ts) |
| FormatHelpers | Utility functions for data formatting | [FormatHelpers.ts](./agentkit-core/src/BaseActions/FormatHelpers.ts) |
| GetBalance | Retrieve token balances | [GetBalance.ts](./agentkit-core/src/BaseActions/GetBalance.ts) |
| GetStatusFromUserop | Check transaction status | [GetStatusFromUserop.ts](./agentkit-core/src/BaseActions/GetStatusFromUserop.ts) |
| ReadContract | Read data from smart contracts | [ReadContract.ts](./agentkit-core/src/BaseActions/ReadContract.ts) |

## High-Level Actions

| Action | Description | File | Base Actions Used |
|--------|-------------|------|------------------|
| SmartTransfer | Execute gasless token transfers | [smartTransferAction.ts](./agentkit-core/src/Actions/smartTransferAction.ts) | SendTransactions |
| CheckTransaction | Monitor transaction status | [checkTransactionAction.ts](./agentkit-core/src/Actions/checkTransactionAction.ts) | CheckTransactions |
| GetAddress | Retrieve wallet addresses | [getAddressAction.ts](./agentkit-core/src/Actions/getAddressAction.ts) | GetAddressActions|
| GetBalance | Check token balances | [getBalanceAction.ts](./agentkit-core/src/Actions/getBalanceAction.ts) | GetBalance |
| GetTokenDetails | Fetch token information | [getTokenDetailsAction.ts](./agentkit-core/src/Actions/getTokenDetailsAction.ts) | GetTokenDetails |
| SmartSwap | Perform token swaps | [smartSwapAction/](./agentkit-core/src/Actions/smartSwapAction/) | SwapTransactions |

# 🚀 Quickstarts

## 📘 Typescript

### By use case
- **Money transmission**
  - Send and receive payments [[SmartTransfer](./agentkit-core/src/Actions/smartTransferAction.ts)]
  - Check transaction status [[CheckTransaction](./agentkit-core/src/Actions/checkTransactionAction.ts)]
  - Get wallet address [[GetAddress](./agentkit-core/src/Actions/getAddressAction.ts)]
- **Token Operations**
  - Check token balances [[GetBalance](./agentkit-core/src/Actions/getBalanceAction.ts)]
  - Get token details [[GetTokenDetails](./agentkit-core/src/Actions/getTokenDetailsAction.ts)]
  - Create new tokens [[CreateFourmemeToken](./agentkit-core/src/Actions/createFourmemeTokenAction.ts)]
- **DeFi Operations**
  - Swap tokens without gas fees
  - Wrap ETH to WETH
  - Interact with DEX protocols

# 🛠️ Supported Tools and Frameworks

## Tools

| Plugin | Tools |
| --- | --- |
| Smart Transfer | Execute gasless token transfers |
| Smart Swap | Perform token swaps without gas |
| Token Creation | Deploy new tokens |
| Balance Check | Check token balances |
| Transaction Monitor | Monitor transaction status |
| Contract Reader | Read smart contract data |

## Common Use Cases

| Use Case | Required Actions | Description |
|----------|-----------------|-------------|
| Token Transfer | GetAddress, GetBalance, SmartTransfer, CheckTransaction | Complete flow for transferring tokens |
| Token Creation | CreateFourmemeToken, GetTokenDetails | Deploy and verify new tokens |
| Token Swap | GetBalance, SmartSwap, CheckTransaction | Swap tokens with gasless execution |
| Balance Check | GetAddress, GetBalance | Check balances for any token |
| Transaction Monitoring | CheckTransaction | Monitor transaction status |

# 💻 Contributing

AgentKit welcomes community contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

Some ways you can contribute:
- Adding new actions to the core package
- Updating existing Langchain Toolkits or adding new ones
- Creating new AI frameworks extensions
- Adding tests and improving documentation

# 📖 Documentation

- [AgentKit Documentation](https://docs.0xgasless.com/docs)

# 🔒 Security

The AgentKit team takes security seriously.
See [SECURITY.md](SECURITY.md) for more information.

# 📄 License

Apache-2.0

# 🤝 Community
- Follow us on [X](https://x.com/0xGasless)
- Follow us on [LinkedIn](https://www.linkedin.com/company/0xgasless/)



