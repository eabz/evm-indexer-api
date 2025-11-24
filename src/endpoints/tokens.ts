import type { Context } from 'hono'
import { z } from 'zod'
import { TokenSchema } from '@/db'
import {
  BaseListEndpoint,
  ChainFilterSchema,
  PaginationSchema,
  type FilterCondition
} from '@/endpoints/common'

const TokenFilterSchema = PaginationSchema.merge(ChainFilterSchema).extend({
  address: z.string().optional().describe('Filter by token address'),
  name: z.string().optional().describe('Filter by token name (partial match)'),
  symbol: z.string().optional().describe('Filter by token symbol (partial match)'),
  type: z.string().optional().describe('Filter by token type (ERC20, ERC721, ERC1155)')
})

const tokenFilterMapping: Record<string, FilterCondition> = {
  chain: { column: 'chain', param: 'chain', operator: '=', type: 'UInt64' },
  address: { column: 'address', param: 'address', operator: 'ILIKE', type: 'String' },
  name: { column: 'name', param: 'name', operator: 'ILIKE', type: 'String' },
  symbol: { column: 'symbol', param: 'symbol', operator: 'ILIKE', type: 'String' },
  type: { column: 'type', param: 'type', operator: '=', type: 'String' }
}

export class TokenList extends BaseListEndpoint {
  schema = {
    summary: 'List Tokens',
    description: 'Retrieve a paginated list of tokens with optional filters for chain, address, name, symbol, and type.',
    tags: ['Tokens'],
    request: {
      query: TokenFilterSchema
    },
    responses: {
      '200': {
        description: 'Returns a list of tokens',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(TokenSchema),
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
    return this.fetchList(c, 'indexer.tokens', 'address ASC', TokenSchema, tokenFilterMapping)
  }
}
