import type { Context } from 'hono'
import { z } from 'zod'
import { BlockSchema } from '@/db'
import {
  BaseListEndpoint,
  PaginationSchema,
  ChainFilterSchema,
  BlockRangeFilterSchema,
  TimeRangeFilterSchema,
  type FilterCondition
} from '@/endpoints/common'

const BlockFilterSchema = PaginationSchema.merge(ChainFilterSchema)
  .merge(BlockRangeFilterSchema)
  .merge(TimeRangeFilterSchema)
  .extend({
    miner: z.string().optional().describe('Filter by miner address'),
    hash: z.string().optional().describe('Filter by block hash')
  })

const blockFilterMapping: Record<string, FilterCondition> = {
  chain: { column: 'chain', param: 'chain', operator: '=', type: 'UInt64' },
  block_number: { column: 'number', param: 'block_number', operator: '=', type: 'UInt32' },
  from_block: { column: 'number', param: 'from_block', operator: '>=', type: 'UInt32' },
  to_block: { column: 'number', param: 'to_block', operator: '<=', type: 'UInt32' },
  from_timestamp: { column: 'timestamp', param: 'from_timestamp', operator: '>=', type: 'DateTime' },
  to_timestamp: { column: 'timestamp', param: 'to_timestamp', operator: '<=', type: 'DateTime' },
  miner: { column: 'miner', param: 'miner', operator: 'ILIKE', type: 'String' },
  hash: { column: 'hash', param: 'hash', operator: '=', type: 'String' }
}

export class BlockList extends BaseListEndpoint {
  schema = {
    summary: 'List Blocks',
    description:
      'Retrieve a paginated list of blocks with optional filters for chain, block range, time range, miner, and hash.',
    tags: ['Blocks'],
    request: {
      query: BlockFilterSchema
    },
    responses: {
      '200': {
        description: 'Returns a list of blocks',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(BlockSchema),
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
    return this.fetchList(c, 'indexer.blocks', 'timestamp DESC', BlockSchema, blockFilterMapping)
  }
}
