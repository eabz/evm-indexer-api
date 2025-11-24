import type { Context } from 'hono'
import { z } from 'zod'
import { LogSchema } from '@/db'
import {
  BaseListEndpoint,
  BlockRangeFilterSchema,
  ChainFilterSchema,
  PaginationSchema,
  TimeRangeFilterSchema,
  type FilterCondition
} from '@/endpoints/common'

const LogFilterSchema = PaginationSchema.merge(ChainFilterSchema)
  .merge(BlockRangeFilterSchema)
  .merge(TimeRangeFilterSchema)
  .extend({
    address: z.string().optional().describe('Filter by contract address'),
    transaction_hash: z.string().optional().describe('Filter by transaction hash'),
    topic0: z.string().optional().describe('Filter by topic0 (event signature)'),
    topic1: z.string().optional().describe('Filter by topic1'),
    topic2: z.string().optional().describe('Filter by topic2'),
    topic3: z.string().optional().describe('Filter by topic3')
  })

const logFilterMapping: Record<string, FilterCondition> = {
  chain: { column: 'chain', param: 'chain', operator: '=', type: 'UInt64' },
  block_number: { column: 'block_number', param: 'block_number', operator: '=', type: 'UInt32' },
  from_block: { column: 'block_number', param: 'from_block', operator: '>=', type: 'UInt32' },
  to_block: { column: 'block_number', param: 'to_block', operator: '<=', type: 'UInt32' },
  from_timestamp: { column: 'timestamp', param: 'from_timestamp', operator: '>=', type: 'DateTime' },
  to_timestamp: { column: 'timestamp', param: 'to_timestamp', operator: '<=', type: 'DateTime' },
  address: { column: 'address', param: 'address', operator: 'ILIKE', type: 'String' },
  transaction_hash: { column: 'transaction_hash', param: 'transaction_hash', operator: '=', type: 'String' },
  topic0: { column: 'topic0', param: 'topic0', operator: '=', type: 'String' },
  topic1: { column: 'topic1', param: 'topic1', operator: '=', type: 'String' },
  topic2: { column: 'topic2', param: 'topic2', operator: '=', type: 'String' },
  topic3: { column: 'topic3', param: 'topic3', operator: '=', type: 'String' }
}

export class LogList extends BaseListEndpoint {
  schema = {
    summary: 'List Logs',
    description: 'Retrieve a paginated list of event logs with optional filters for chain, block range, time range, address, transaction, and topics.',
    tags: ['Logs'],
    request: {
      query: LogFilterSchema
    },
    responses: {
      '200': {
        description: 'Returns a list of logs',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(LogSchema),
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
    return this.fetchList(c, 'indexer.logs', 'timestamp DESC', LogSchema, logFilterMapping)
  }
}
