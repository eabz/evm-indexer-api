import { DexTradeSchema } from '@/db'
import {
  BaseListEndpoint,
  BlockRangeFilterSchema,
  ChainFilterSchema,
  type FilterCondition,
  PaginationSchema,
  TimeRangeFilterSchema
} from '@/endpoints/common'
import type { Context } from 'hono'
import { z } from 'zod'

const DexTradeFilterSchema = PaginationSchema.merge(ChainFilterSchema)
  .merge(BlockRangeFilterSchema)
  .merge(TimeRangeFilterSchema)
  .extend({
    pool_address: z.string().optional().describe('Filter by liquidity pool address'),
    sender: z.string().optional().describe('Filter by sender address'),
    recipient: z.string().optional().describe('Filter by recipient address'),
    transaction_hash: z.string().optional().describe('Filter by transaction hash'),
    dex_name: z.string().optional().describe('Filter by DEX name (e.g., uniswap_v2, uniswap_v3, sushiswap)')
  })

const dexTradeFilterMapping: Record<string, FilterCondition> = {
  chain: { column: 'chain', param: 'chain', operator: '=', type: 'UInt64' },
  block_number: { column: 'block_number', param: 'block_number', operator: '=', type: 'UInt32' },
  from_block: { column: 'block_number', param: 'from_block', operator: '>=', type: 'UInt32' },
  to_block: { column: 'block_number', param: 'to_block', operator: '<=', type: 'UInt32' },
  from_timestamp: { column: 'timestamp', param: 'from_timestamp', operator: '>=', type: 'DateTime' },
  to_timestamp: { column: 'timestamp', param: 'to_timestamp', operator: '<=', type: 'DateTime' },
  pool_address: { column: 'pool_address', param: 'pool_address', operator: 'ILIKE', type: 'String' },
  sender: { column: 'sender', param: 'sender', operator: 'ILIKE', type: 'String' },
  recipient: { column: 'recipient', param: 'recipient', operator: 'ILIKE', type: 'String' },
  transaction_hash: { column: 'transaction_hash', param: 'transaction_hash', operator: '=', type: 'String' },
  dex_name: { column: 'dex_name', param: 'dex_name', operator: '=', type: 'String' }
}

export class DexTradeList extends BaseListEndpoint {
  schema = {
    summary: 'List DEX Trades',
    description:
      'Retrieve a paginated list of DEX trades with optional filters for chain, block range, time range, pool, addresses, and DEX name.',
    tags: ['DEX Trades'],
    request: {
      query: DexTradeFilterSchema
    },
    responses: {
      '200': {
        description: 'Returns a list of DEX trades',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(DexTradeSchema),
              pagination: z.object({
                page: z.number(),
                limit: z.number(),
                total: z.number(),
                total_pages: z.number(),
                has_next: z.boolean(),
                has_prev: z.boolean()
              })
            })
          }
        }
      }
    }
  }

  handle(c: Context<{ Bindings: Env }>) {
    return this.fetchList(c, 'indexer.dex_trades', 'timestamp DESC', DexTradeSchema, dexTradeFilterMapping)
  }
}
