import type { Context } from 'hono'
import { z } from 'zod'
import { DexTradeSchema } from '@/db'
import { BaseListEndpoint } from '@/endpoints/common'

export class DexTradeList extends BaseListEndpoint {
  schema = {
    summary: 'List DEX Trades',
    tags: ['DEX Trades'],
    request: {
      query: z.object({
        page: z.number().default(1),
        limit: z.number().default(10)
      })
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
                limit: z.number()
              })
            })
          }
        }
      }
    }
  }

  handle(c: Context<{ Bindings: Env }>) {
    return this.fetchList(c, 'indexer.dex_trades', 'timestamp DESC', DexTradeSchema)
  }
}
