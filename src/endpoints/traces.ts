import type { Context } from 'hono'
import { z } from 'zod'
import { TraceSchema } from '@/db'
import {
  BaseListEndpoint,
  BlockRangeFilterSchema,
  ChainFilterSchema,
  PaginationSchema,
  type FilterCondition
} from '@/endpoints/common'

const TraceFilterSchema = PaginationSchema.merge(ChainFilterSchema)
  .merge(BlockRangeFilterSchema)
  .extend({
    transaction_hash: z.string().optional().describe('Filter by transaction hash'),
    from: z.string().optional().describe('Filter by from address'),
    to: z.string().optional().describe('Filter by to address'),
    action_type: z.string().optional().describe('Filter by action type (call, create, suicide, reward)'),
    call_type: z.string().optional().describe('Filter by call type (call, delegatecall, staticcall)')
  })

const traceFilterMapping: Record<string, FilterCondition> = {
  chain: { column: 'chain', param: 'chain', operator: '=', type: 'UInt64' },
  block_number: { column: 'block_number', param: 'block_number', operator: '=', type: 'UInt32' },
  from_block: { column: 'block_number', param: 'from_block', operator: '>=', type: 'UInt32' },
  to_block: { column: 'block_number', param: 'to_block', operator: '<=', type: 'UInt32' },
  transaction_hash: { column: 'transaction_hash', param: 'transaction_hash', operator: '=', type: 'String' },
  from: { column: 'from', param: 'from_addr', operator: 'ILIKE', type: 'String' },
  to: { column: 'to', param: 'to_addr', operator: 'ILIKE', type: 'String' },
  action_type: { column: 'action_type', param: 'action_type', operator: '=', type: 'String' },
  call_type: { column: 'call_type', param: 'call_type', operator: '=', type: 'String' }
}

export class TraceList extends BaseListEndpoint {
  schema = {
    summary: 'List Traces',
    description: 'Retrieve a paginated list of internal transaction traces with optional filters for chain, block range, addresses, action type, and call type.',
    tags: ['Traces'],
    request: {
      query: TraceFilterSchema
    },
    responses: {
      '200': {
        description: 'Returns a list of traces',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(TraceSchema),
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
    return this.fetchList(c, 'indexer.traces', 'block_number DESC', TraceSchema, traceFilterMapping)
  }
}
