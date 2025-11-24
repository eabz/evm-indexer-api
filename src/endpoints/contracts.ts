import type { Context } from 'hono'
import { z } from 'zod'
import { ContractSchema } from '@/db'
import {
  BaseListEndpoint,
  BlockRangeFilterSchema,
  ChainFilterSchema,
  PaginationSchema,
  type FilterCondition
} from '@/endpoints/common'

const ContractFilterSchema = PaginationSchema.merge(ChainFilterSchema)
  .merge(BlockRangeFilterSchema)
  .extend({
    contract_address: z.string().optional().describe('Filter by contract address'),
    creator: z.string().optional().describe('Filter by creator address'),
    transaction_hash: z.string().optional().describe('Filter by deployment transaction hash')
  })

const contractFilterMapping: Record<string, FilterCondition> = {
  chain: { column: 'chain', param: 'chain', operator: '=', type: 'UInt64' },
  block_number: { column: 'block_number', param: 'block_number', operator: '=', type: 'UInt32' },
  from_block: { column: 'block_number', param: 'from_block', operator: '>=', type: 'UInt32' },
  to_block: { column: 'block_number', param: 'to_block', operator: '<=', type: 'UInt32' },
  contract_address: { column: 'contract_address', param: 'contract_address', operator: 'ILIKE', type: 'String' },
  creator: { column: 'creator', param: 'creator', operator: 'ILIKE', type: 'String' },
  transaction_hash: { column: 'transaction_hash', param: 'transaction_hash', operator: '=', type: 'String' }
}

export class ContractList extends BaseListEndpoint {
  schema = {
    summary: 'List Contracts',
    description: 'Retrieve a paginated list of deployed contracts with optional filters for chain, block range, addresses, and transaction hash.',
    tags: ['Contracts'],
    request: {
      query: ContractFilterSchema
    },
    responses: {
      '200': {
        description: 'Returns a list of contracts',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(ContractSchema),
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
    return this.fetchList(c, 'indexer.contracts', 'block_number DESC', ContractSchema, contractFilterMapping)
  }
}
