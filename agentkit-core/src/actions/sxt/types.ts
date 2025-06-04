import { z } from "zod";

// ========================================
// Common Types
// ========================================

export interface SXTResponse {
  success: boolean;
  data: unknown[];
  error?: string;
}

export interface PriceData {
  chain_name: string;
  token_symbol: string;
  price_usd: string;
  volume_24h: string;
  last_updated: string;
  block_number: string;
}

export interface TransactionData {
  transaction_hash: string;
  block_number: string;
  block_timestamp: string;
  from_address: string;
  to_address: string;
  value: string;
  gas_used: string;
  gas_price: string;
  status: string;
}

export interface TransferData {
  transaction_hash: string;
  block_number: string;
  block_timestamp: string;
  token_address: string;
  from_address: string;
  to_address: string;
  amount: string;
  token_symbol: string;
  usd_value: string;
}

// ========================================
// Input Schemas
// ========================================

export const SXTQueryInput = z.object({
  sql: z.string().describe("SQL query to execute on Space and Time database"),
  requestProof: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to generate ZK proof for the query results"),
  schema: z
    .string()
    .optional()
    .default("ETH")
    .describe("Schema/namespace to query (e.g., 'ETH', 'POLYGON', 'BTC')"),
});

export const SXTCrossChainPriceInput = z.object({
  token: z.string().describe("Token symbol or address (e.g., 'ETH', 'USDC', '0x...')"),
  chains: z
    .array(z.string())
    .optional()
    .default(["ethereum", "polygon", "arbitrum"])
    .describe("Array of chain names to query"),
  timeframe: z
    .enum(["1h", "24h", "7d", "30d"])
    .optional()
    .default("24h")
    .describe("Time period for price data"),
});

export const SXTDeFiAnalyticsInput = z.object({
  protocol: z.string().describe("DeFi protocol name (e.g., 'uniswap', 'aave', 'compound')"),
  metric: z.enum(["tvl", "volume", "fees", "apr", "users"]).describe("Metric to analyze"),
  chain: z.string().optional().default("ethereum").describe("Blockchain to analyze"),
  period: z.enum(["1d", "7d", "30d"]).optional().default("7d").describe("Time period for analysis"),
});

export const SXTVerifyProofInput = z.object({
  proofData: z.string().describe("ZK proof data from SXT query result"),
  queryHash: z.string().describe("Hash of the original SQL query"),
  commitmentHash: z.string().describe("Table commitment hash from SXT"),
  chain: z.string().optional().default("ethereum").describe("Chain to verify proof on"),
});

export const SXTHistoricalDataInput = z.object({
  dataType: z
    .enum(["transactions", "blocks", "events", "transfers"])
    .describe("Type of historical data to query"),
  address: z.string().describe("Contract or wallet address to analyze"),
  fromBlock: z.number().describe("Starting block number"),
  toBlock: z.number().optional().describe("Ending block number"),
  chain: z.string().optional().default("ethereum").describe("Blockchain to query"),
  limit: z.number().optional().default(100).describe("Maximum number of records to return"),
});

// ========================================
// Type Exports
// ========================================

export type SXTQueryParams = z.infer<typeof SXTQueryInput>;
export type SXTCrossChainPriceParams = z.infer<typeof SXTCrossChainPriceInput>;
export type SXTDeFiAnalyticsParams = z.infer<typeof SXTDeFiAnalyticsInput>;
export type SXTVerifyProofParams = z.infer<typeof SXTVerifyProofInput>;
export type SXTHistoricalDataParams = z.infer<typeof SXTHistoricalDataInput>;
