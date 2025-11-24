import type { Context } from 'hono'
import { z } from 'zod'
import { TokenSchema } from '@/db'
import { BaseListEndpoint } from '@/endpoints/common'

export class TokenList extends BaseListEndpoint {
  schema = {
    summary: 'List Tokens',
    tags: ['Tokens'],
    request: {
      query: z.object({
        page: z.number().default(1),
        limit: z.number().default(10)
      })
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
                limit: z.number()
              })
            })
          }
        }
      }
    }
  }

  handle(c: Context<{ Bindings: Env }>) {
    return this.fetchList(c, 'indexer.tokens', 'address ASC', TokenSchema)
  }
}
