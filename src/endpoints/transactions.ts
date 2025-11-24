import type { Context } from 'hono'
import { z } from 'zod'
import { TransactionSchema } from '@/db'
import {
  BaseListEndpoint,
  BlockRangeFilterSchema,
  ChainFilterSchema,
  PaginationSchema,
  TimeRangeFilterSchema,
  type FilterCondition
} from '@/endpoints/common'

const TransactionFilterSchema = PaginationSchema.merge(ChainFilterSchema)
  .merge(BlockRangeFilterSchema)
  .merge(TimeRangeFilterSchema)
  .extend({
    hash: z.string().optional().describe('Filter by transaction hash'),
    from: z.string().optional().describe('Filter by sender address'),
    to: z.string().optional().describe('Filter by recipient address'),
    method: z.string().optional().describe('Filter by method selector (e.g., 0xa9059cbb)'),
    status: z.string().optional().describe('Filter by transaction status (e.g., 0x1 for success)')
  })

const transactionFilterMapping: Record<string, FilterCondition> = {
  chain: { column: 'chain', param: 'chain', operator: '=', type: 'UInt64' },
  block_number: { column: 'block_number', param: 'block_number', operator: '=', type: 'UInt32' },
  from_block: { column: 'block_number', param: 'from_block', operator: '>=', type: 'UInt32' },
  to_block: { column: 'block_number', param: 'to_block', operator: '<=', type: 'UInt32' },
  from_timestamp: { column: 'timestamp', param: 'from_timestamp', operator: '>=', type: 'DateTime' },
  to_timestamp: { column: 'timestamp', param: 'to_timestamp', operator: '<=', type: 'DateTime' },
  hash: { column: 'hash', param: 'hash', operator: '=', type: 'String' },
  from: { column: 'from', param: 'from_addr', operator: 'ILIKE', type: 'String' },
  to: { column: 'to', param: 'to_addr', operator: 'ILIKE', type: 'String' },
  method: { column: 'method', param: 'method', operator: '=', type: 'String' },
  status: { column: 'status', param: 'status', operator: '=', type: 'String' }
}

export class TransactionList extends BaseListEndpoint {
  schema = {
    summary: 'List Transactions',
    description:
      'Retrieve a paginated list of transactions with optional filters for chain, block range, time range, addresses, method, and status.',
    tags: ['Transactions'],
    request: {
      query: TransactionFilterSchema
    },
    responses: {
      '200': {
        description: 'Returns a list of transactions',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(TransactionSchema),
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
    return this.fetchList(c, 'indexer.transactions', 'timestamp DESC', TransactionSchema, transactionFilterMapping)
  }
}
