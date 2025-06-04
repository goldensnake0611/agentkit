# SXT Backend Server

A Node.js backend server that provides a REST API for accessing blockchain data through Space and Time (SXT).

## Features

- RESTful API endpoints for blockchain data
- Authentication with Space and Time
- Support for multiple chains (ETH, BSC, etc.)
- Real-time data access
- Cross-chain token price tracking
- DeFi protocol data integration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Space and Time account and credentials

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template and configure your variables:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and add your Space and Time credentials:
   - SXT_USER_ID
   - SXT_JOIN_CODE
   - SXT_PRIVATE_KEY

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on port 3001 by default (configurable via PORT in .env).

## API Endpoints

### Health Check
- `GET /health`
  - Returns server status and SXT connection state

### Custom SQL Query
- `POST /api/query`
  - Body: `{ "sql": "YOUR_SQL_QUERY", "schema": "SCHEMA_NAME" }`

### Latest Blocks
- `GET /api/blocks/:chain`
  - Query params: `limit` (default: 10)

### Latest Transactions
- `GET /api/transactions/:chain`
  - Query params: `limit` (default: 10), `minValue` (default: 0)

### Token Transfers
- `GET /api/transfers/:chain`
  - Query params: `limit` (default: 10), `token` (optional)

### DeFi Protocol Data
- `GET /api/defi/:protocol`
  - Query params: `chain` (default: ETH), `limit` (default: 5)

### Address Activity
- `GET /api/address/:address`
  - Query params: `chain` (default: ETH), `limit` (default: 20)

### Cross-chain Token Prices
- `GET /api/prices/:token`
  - Query params: `chains` (comma-separated list, default: ethereum)

## Error Handling

All endpoints return standardized JSON responses:

Success:
```json
{
  "success": true,
  "data": [...],
  "timestamp": "2024-03-21T12:00:00.000Z"
}
```

Error:
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-03-21T12:00:00.000Z"
}
```

## Security

- All endpoints require SXT authentication
- CORS is enabled for cross-origin requests
- Environment variables for sensitive data
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 