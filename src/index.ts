import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import {
  BlockList,
  ContractList,
  DexTradeList,
  Erc1155TransferList,
  Erc20TransferList,
  Erc721TransferList,
  LogList,
  SyncStatus,
  TokenList,
  TraceList,
  TransactionList,
  WithdrawalList
} from '@/endpoints'

// Start a Hono app
const app = new Hono<{ Bindings: Env }>()

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: '/'
})

// ClickHouse API Endpoints
openapi.get('/api/blocks', BlockList)
openapi.get('/api/contracts', ContractList)
openapi.get('/api/logs', LogList)
openapi.get('/api/transfers/erc20', Erc20TransferList)
openapi.get('/api/transfers/erc721', Erc721TransferList)
openapi.get('/api/transfers/erc1155', Erc1155TransferList)
openapi.get('/api/traces', TraceList)
openapi.get('/api/transactions', TransactionList)
openapi.get('/api/withdrawals', WithdrawalList)
openapi.get('/api/dex_trades', DexTradeList)
openapi.get('/api/tokens', TokenList)

// Utility Endpoints
openapi.get('/api/status/sync', SyncStatus)

// Export the Hono app
export default app
