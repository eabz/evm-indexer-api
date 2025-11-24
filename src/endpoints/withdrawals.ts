import type { Context } from 'hono'
import { z } from 'zod'
import { WithdrawalSchema } from '@/db'
import {
  BaseListEndpoint,
  BlockRangeFilterSchema,
  ChainFilterSchema,
  PaginationSchema,
  TimeRangeFilterSchema,
  type FilterCondition
} from '@/endpoints/common'

const WithdrawalFilterSchema = PaginationSchema.merge(ChainFilterSchema)
  .merge(BlockRangeFilterSchema)
  .merge(TimeRangeFilterSchema)
  .extend({
    address: z.string().optional().describe('Filter by withdrawal recipient address'),
    validator_index: z.coerce.number().optional().describe('Filter by validator index')
  })

const withdrawalFilterMapping: Record<string, FilterCondition> = {
  chain: { column: 'chain', param: 'chain', operator: '=', type: 'UInt64' },
  block_number: { column: 'block_number', param: 'block_number', operator: '=', type: 'UInt32' },
  from_block: { column: 'block_number', param: 'from_block', operator: '>=', type: 'UInt32' },
  to_block: { column: 'block_number', param: 'to_block', operator: '<=', type: 'UInt32' },
  from_timestamp: { column: 'timestamp', param: 'from_timestamp', operator: '>=', type: 'DateTime' },
  to_timestamp: { column: 'timestamp', param: 'to_timestamp', operator: '<=', type: 'DateTime' },
  address: { column: 'address', param: 'address', operator: 'ILIKE', type: 'String' },
  validator_index: { column: 'validator_index', param: 'validator_index', operator: '=', type: 'UInt64' }
}

export class WithdrawalList extends BaseListEndpoint {
  schema = {
    summary: 'List Withdrawals',
    description: 'Retrieve a paginated list of validator withdrawals with optional filters for chain, block range, time range, address, and validator index.',
    tags: ['Withdrawals'],
    request: {
      query: WithdrawalFilterSchema
    },
    responses: {
      '200': {
        description: 'Returns a list of withdrawals',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(WithdrawalSchema),
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
    return this.fetchList(c, 'indexer.withdrawals', 'timestamp DESC', WithdrawalSchema, withdrawalFilterMapping)
  }
}
