import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import { BlockList } from './endpoints/blocks'
import { ContractList } from './endpoints/contracts'
import { DexTradeList } from './endpoints/dexTrades'
import { LogList } from './endpoints/logs'
import { TokenList } from './endpoints/tokens'
import { TraceList } from './endpoints/traces'
import { TransactionList } from './endpoints/transactions'
import { Erc1155TransferList, Erc20TransferList, Erc721TransferList } from './endpoints/transfers'
import { WithdrawalList } from './endpoints/withdrawals'

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

// Export the Hono app
export default app
