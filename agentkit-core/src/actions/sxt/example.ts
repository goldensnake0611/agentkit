import { createWallet } from "../../services";
import { SxtAction } from "./index";

async function main() {
  // Initialize wallet using the SDK's createWallet function
  const wallet = await createWallet();
  const sxtAction = new SxtAction();

  // Example 1: Basic SQL Query
  const queryResult = await sxtAction.func(wallet, {
    action: "query",
    params: {
      sql: "SELECT * FROM ETH.TRANSACTIONS LIMIT 10",
      requestProof: true,
      schema: "ETH",
    },
  });
  console.log("Query Result:", JSON.parse(queryResult));

  // Example 2: Cross-Chain Price Analysis
  const priceResult = await sxtAction.func(wallet, {
    action: "price",
    params: {
      token: "ETH",
      chains: ["ethereum", "polygon", "arbitrum"],
      timeframe: "24h",
    },
  });
  console.log("Price Analysis:", JSON.parse(priceResult));

  // Example 3: DeFi Protocol Analytics
  const analyticsResult = await sxtAction.func(wallet, {
    action: "analytics",
    params: {
      protocol: "uniswap",
      metric: "tvl",
      chain: "ethereum",
      period: "7d",
    },
  });
  console.log("DeFi Analytics:", JSON.parse(analyticsResult));

  // Example 4: ZK Proof Verification
  const verifyResult = await sxtAction.func(wallet, {
    action: "verify",
    params: {
      proofData: "your_proof_data",
      queryHash: "your_query_hash",
      commitmentHash: "your_commitment_hash",
      chain: "ethereum",
    },
  });
  console.log("Proof Verification:", JSON.parse(verifyResult));

  // Example 5: Historical Data Analysis
  const historicalResult = await sxtAction.func(wallet, {
    action: "historical",
    params: {
      dataType: "transactions",
      address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Example address
      fromBlock: 15000000,
      toBlock: 15001000,
      chain: "ethereum",
      limit: 100,
    },
  });
  console.log("Historical Data:", JSON.parse(historicalResult));
}

// Error handling wrapper
async function runExample() {
  try {
    await main();
  } catch (error) {
    console.error("Error running examples:", error);
  }
}

// Run the examples
runExample();
