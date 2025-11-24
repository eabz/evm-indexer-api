import type { Context } from 'hono'
import { z } from 'zod'
import { BlockSchema } from '@/db'
import { BaseListEndpoint } from '@/endpoints/common'

export class BlockList extends BaseListEndpoint {
  schema = {
    summary: 'List Blocks',
    tags: ['Blocks'],
    request: {
      query: z.object({
        page: z.number().default(1),
        limit: z.number().default(10)
      })
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
                limit: z.number()
              })
            })
          }
        }
      }
    }
  }

  handle(c: Context<{ Bindings: Env }>) {
    return this.fetchList(c, 'indexer.blocks', 'timestamp DESC', BlockSchema)
  }
}
