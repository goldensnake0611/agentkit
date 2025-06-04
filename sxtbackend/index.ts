// ========================================
// SXT Test Server for Postman Testing
// ========================================

const express = require("express");
const cors = require("cors");
const { SpaceAndTime } = require("sxt-nodejs-sdk");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Global SXT instance
let sxt = null;
let isAuthenticated = false;

// ========================================
// SXT Authentication Helper
// ========================================
async function initializeSXT() {
  try {
    console.log("🔧 Initializing Space and Time SDK...");

    sxt = new SpaceAndTime();

    // Check if we have all required environment variables
    const requiredEnvVars = ["SXT_USER_ID", "SXT_JOIN_CODE", "SXT_PRIVATE_KEY"];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
    }

    console.log("🔑 Authenticating with SXT...");

    // Authenticate using the SDK's authenticate method
    await sxt.authenticate();

    isAuthenticated = true;
    console.log("✅ SXT authentication successful!");

    return true;
  } catch (error) {
    console.error("❌ SXT initialization failed:", error.message);
    isAuthenticated = false;
    return false;
  }
}

// ========================================
// Health Check Endpoint
// ========================================
app.get("/health", async (req, res) => {
  const startTime = Date.now();

  try {
    if (!isAuthenticated) {
      await initializeSXT();
    }

    // Test with a simple query
    const [success, rows] = await sxt.execute_query("SELECT 1 as health_check");

    res.json({
      status: "healthy",
      sxtAuthenticated: isAuthenticated,
      sxtConnected: success,
      latency: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      testQuery: success ? "passed" : "failed",
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      sxtAuthenticated: isAuthenticated,
      error: error.message,
      latency: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  }
});

// ========================================
// Generic Query Endpoint
// ========================================
app.post("/api/query", async (req, res) => {
  try {
    if (!isAuthenticated) {
      const initialized = await initializeSXT();
      if (!initialized) {
        return res.status(500).json({
          success: false,
          error: "SXT authentication failed",
          suggestion: "Check your environment variables",
        });
      }
    }

    const { sql, schema = "ETH" } = req.body;

    if (!sql) {
      return res.status(400).json({
        success: false,
        error: "SQL query is required",
        example: "SELECT * FROM ETH.BLOCKS LIMIT 5",
      });
    }

    console.log(`🔍 Executing query: ${sql}`);
    const startTime = Date.now();

    const [success, rows] = await sxt.execute_query(sql);
    const executionTime = Date.now() - startTime;

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Query execution failed",
        query: sql,
        executionTime,
      });
    }

    res.json({
      success: true,
      data: rows || [],
      metadata: {
        rowCount: rows ? rows.length : 0,
        executionTime,
        schema,
        query: sql,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      suggestion: "Check your SQL syntax and table permissions",
    });
  }
});

// ========================================
// Predefined Blockchain Data Endpoints
// ========================================

// Get latest blocks
app.get("/api/blocks/:chain?", async (req, res) => {
  try {
    if (!isAuthenticated) await initializeSXT();

    const chain = (req.params.chain || "ETH").toUpperCase();
    const limit = req.query.limit || 10;

    const sql = `
      SELECT 
        block_number,
        block_hash,
        block_timestamp,
        transaction_count,
        gas_used,
        gas_limit,
        miner
      FROM ${chain}.BLOCKS 
      ORDER BY block_number DESC 
      LIMIT ${limit}
    `;

    const [success, rows] = await sxt.execute_query(sql);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Failed to fetch blocks",
      });
    }

    res.json({
      success: true,
      chain,
      blocks: rows,
      count: rows.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get latest transactions
app.get("/api/transactions/:chain?", async (req, res) => {
  try {
    if (!isAuthenticated) await initializeSXT();

    const chain = (req.params.chain || "ETH").toUpperCase();
    const limit = req.query.limit || 10;
    const minValue = req.query.minValue || 0;

    const sql = `
      SELECT 
        transaction_hash,
        block_number,
        block_timestamp,
        from_address,
        to_address,
        value,
        gas_used,
        gas_price,
        status
      FROM ${chain}.TRANSACTIONS 
      WHERE value >= ${minValue}
      ORDER BY block_number DESC 
      LIMIT ${limit}
    `;

    const [success, rows] = await sxt.execute_query(sql);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Failed to fetch transactions",
      });
    }

    res.json({
      success: true,
      chain,
      transactions: rows,
      count: rows.length,
      filters: { minValue },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get token transfers
app.get("/api/transfers/:chain?", async (req, res) => {
  try {
    if (!isAuthenticated) await initializeSXT();

    const chain = (req.params.chain || "ETH").toUpperCase();
    const limit = req.query.limit || 10;
    const token = req.query.token; // Optional token filter

    let sql = `
      SELECT 
        transaction_hash,
        block_number,
        block_timestamp,
        token_address,
        token_symbol,
        from_address,
        to_address,
        amount,
        usd_value
      FROM ${chain}.TOKEN_TRANSFERS 
    `;

    if (token) {
      sql += ` WHERE token_symbol = '${token.toUpperCase()}'`;
    }

    sql += ` ORDER BY block_number DESC LIMIT ${limit}`;

    const [success, rows] = await sxt.execute_query(sql);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Failed to fetch token transfers",
      });
    }

    res.json({
      success: true,
      chain,
      transfers: rows,
      count: rows.length,
      filters: { token },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get DeFi protocol data
app.get("/api/defi/:protocol?", async (req, res) => {
  try {
    if (!isAuthenticated) await initializeSXT();

    const protocol = req.params.protocol;
    const chain = (req.query.chain || "ETH").toUpperCase();
    const limit = req.query.limit || 10;

    let sql = `
      SELECT 
        protocol_name,
        pool_name,
        tvl_usd,
        volume_24h_usd,
        apr_percentage,
        block_timestamp
      FROM ${chain}.DEFI_PROTOCOLS 
    `;

    if (protocol) {
      sql += ` WHERE protocol_name ILIKE '%${protocol}%'`;
    }

    sql += ` ORDER BY tvl_usd DESC LIMIT ${limit}`;

    const [success, rows] = await sxt.execute_query(sql);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Failed to fetch DeFi data",
      });
    }

    res.json({
      success: true,
      chain,
      protocol: protocol || "all",
      defiData: rows,
      count: rows.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get address activity
app.get("/api/address/:address", async (req, res) => {
  try {
    if (!isAuthenticated) await initializeSXT();

    const address = req.params.address;
    const chain = (req.query.chain || "ETH").toUpperCase();
    const limit = req.query.limit || 20;

    if (!address || address.length !== 42) {
      return res.status(400).json({
        success: false,
        error: "Valid Ethereum address required (42 characters starting with 0x)",
      });
    }

    const sql = `
      SELECT 
        transaction_hash,
        block_number,
        block_timestamp,
        from_address,
        to_address,
        value,
        gas_used,
        status,
        CASE 
          WHEN from_address = '${address}' THEN 'outgoing'
          WHEN to_address = '${address}' THEN 'incoming'
          ELSE 'unknown'
        END as direction
      FROM ${chain}.TRANSACTIONS 
      WHERE from_address = '${address}' OR to_address = '${address}'
      ORDER BY block_number DESC 
      LIMIT ${limit}
    `;

    const [success, rows] = await sxt.execute_query(sql);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Failed to fetch address activity",
      });
    }

    // Calculate summary stats
    const incoming = rows.filter(tx => tx.direction === "incoming");
    const outgoing = rows.filter(tx => tx.direction === "outgoing");
    const totalValue = rows.reduce((sum, tx) => sum + parseFloat(tx.value || 0), 0);

    res.json({
      success: true,
      address,
      chain,
      transactions: rows,
      summary: {
        totalTransactions: rows.length,
        incomingTransactions: incoming.length,
        outgoingTransactions: outgoing.length,
        totalValue: totalValue.toFixed(6),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get cross-chain token prices
app.get("/api/prices/:token?", async (req, res) => {
  try {
    if (!isAuthenticated) await initializeSXT();

    const token = (req.params.token || "ETH").toUpperCase();
    const chains = req.query.chains
      ? req.query.chains.split(",")
      : ["ETHEREUM", "POLYGON", "ARBITRUM"];

    const chainConditions = chains.map(c => `'${c.toUpperCase()}'`).join(",");

    const sql = `
      SELECT 
        chain_name,
        token_symbol,
        price_usd,
        volume_24h,
        market_cap,
        last_updated
      FROM CROSS_CHAIN.TOKEN_PRICES 
      WHERE token_symbol = '${token}'
        AND chain_name IN (${chainConditions})
      ORDER BY last_updated DESC
    `;

    const [success, rows] = await sxt.execute_query(sql);

    if (!success || rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No price data found for ${token} on specified chains`,
        availableChains: chains,
      });
    }

    // Calculate price spread for arbitrage detection
    const prices = rows.map(row => parseFloat(row.price_usd));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const spread = prices.length > 1 ? ((maxPrice - minPrice) / minPrice) * 100 : 0;

    res.json({
      success: true,
      token,
      chains,
      priceData: rows,
      analysis: {
        minPrice,
        maxPrice,
        spreadPercentage: spread.toFixed(2),
        arbitrageOpportunity: spread > 0.5,
        averagePrice: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(6),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ========================================
// Server Startup
// ========================================
app.listen(PORT, async () => {
  console.log(`🚀 SXT Test Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /health                     - Health check`);
  console.log(`   POST /api/query                  - Custom SQL queries`);
  console.log(`   GET  /api/blocks/:chain          - Latest blocks`);
  console.log(`   GET  /api/transactions/:chain    - Latest transactions`);
  console.log(`   GET  /api/transfers/:chain       - Token transfers`);
  console.log(`   GET  /api/defi/:protocol         - DeFi protocol data`);
  console.log(`   GET  /api/address/:address       - Address activity`);
  console.log(`   GET  /api/prices/:token          - Cross-chain token prices`);
  console.log(`\n🔧 Query parameters:`);
  console.log(`   limit    - Number of results (default: 10)`);
  console.log(`   chain    - Blockchain (ETH, POLYGON, ARBITRUM, etc.)`);
  console.log(`   token    - Token symbol filter`);
  console.log(`   minValue - Minimum transaction value filter`);
  console.log(`\n📝 Example Postman requests:`);
  console.log(`   GET  http://localhost:${PORT}/api/blocks/ETH?limit=5`);
  console.log(`   GET  http://localhost:${PORT}/api/transactions/ETH?minValue=1`);
  console.log(`   GET  http://localhost:${PORT}/api/prices/ETH?chains=ethereum,polygon`);
  console.log(`   POST http://localhost:${PORT}/api/query`);
  console.log(`        Body: {"sql": "SELECT * FROM ETH.BLOCKS LIMIT 5"}`);

  // Initialize SXT on startup
  console.log(`\n🔑 Initializing Space and Time connection...`);
  await initializeSXT();
});

// ========================================
// Error Handling
// ========================================
process.on("uncaughtException", error => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  if (sxt) {
    try {
      await sxt.logout();
      console.log("✅ SXT logout successful");
    } catch (error) {
      console.log("⚠️  SXT logout error:", error.message);
    }
  }
  process.exit(0);
});

module.exports = app;
