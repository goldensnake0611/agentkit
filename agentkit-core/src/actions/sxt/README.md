# Space and Time Actions for AgentKit

This package provides a unified action for interacting with Space and Time's blockchain data platform through AgentKit. The action enables querying blockchain data, analyzing DeFi metrics, verifying ZK proofs, and more.

## Installation

```bash
npm install @agentkit/core
```

## Configuration

Set up your Space and Time credentials in your environment variables:

```bash
SXT_USER_ID=your_user_id
SXT_AUTH_CODE=your_auth_code
SXT_SIGNATURE=your_signature
SXT_PUBLIC_KEY=your_public_key
```

## Usage

The Space and Time action provides a unified interface for all SXT functionality:

```typescript
import { SxtAction } from "@agentkit/core";

const sxtAction = new SxtAction();
```

### Available Actions

The action supports the following operations:

1. **Query** - Execute SQL queries on Space and Time's database
2. **Price** - Get cross-chain token prices and analyze spreads
3. **Analytics** - Analyze DeFi protocol metrics
4. **Verify** - Verify ZK proofs on-chain
5. **Historical** - Query historical blockchain data

### Examples

#### 1. Basic SQL Query

```typescript
const result = await sxtAction.func(wallet, {
  action: "query",
  params: {
    sql: "SELECT * FROM ETH.TRANSACTIONS LIMIT 10",
    requestProof: true,
    schema: "ETH"
  }
});
```

#### 2. Cross-Chain Price Analysis

```typescript
const result = await sxtAction.func(wallet, {
  action: "price",
  params: {
    token: "ETH",
    chains: ["ethereum", "polygon", "arbitrum"],
    timeframe: "24h"
  }
});
```

#### 3. DeFi Protocol Analytics

```typescript
const result = await sxtAction.func(wallet, {
  action: "analytics",
  params: {
    protocol: "uniswap",
    metric: "tvl",
    chain: "ethereum",
    period: "7d"
  }
});
```

#### 4. ZK Proof Verification

```typescript
const result = await sxtAction.func(wallet, {
  action: "verify",
  params: {
    proofData: "your_proof_data",
    queryHash: "your_query_hash",
    commitmentHash: "your_commitment_hash",
    chain: "ethereum"
  }
});
```

#### 5. Historical Data Analysis

```typescript
const result = await sxtAction.func(wallet, {
  action: "historical",
  params: {
    dataType: "transactions",
    address: "0x...",
    fromBlock: 15000000,
    toBlock: 15001000,
    chain: "ethereum",
    limit: 100
  }
});
```

## Response Format

All actions return a JSON string with the following structure:

```typescript
{
  success: boolean;
  data?: unknown[];
  error?: string;
  // Additional fields specific to each action type
}
```

## Error Handling

The action includes built-in error handling and returns descriptive error messages when something goes wrong. Common error scenarios include:

- Authentication failures
- Invalid SQL queries
- Network issues
- Rate limiting
- Invalid parameters

## Best Practices

1. Always handle the response as a JSON string and parse it appropriately
2. Check the `success` field before accessing data
3. Use appropriate error handling for your use case
4. Consider implementing retry logic for transient failures
5. Cache frequently accessed data when possible

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 