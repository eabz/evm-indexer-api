import type { Context } from 'hono'
import { z } from 'zod'
import { TraceSchema } from '../db/schema'
import { BaseListEndpoint } from './common'

export class TraceList extends BaseListEndpoint {
  schema = {
    summary: 'List Traces',
    tags: ['Traces'],
    request: {
      query: z.object({
        page: z.number().default(1),
        limit: z.number().default(10)
      })
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
                limit: z.number()
              })
            })
          }
        }
      }
    }
  }

  handle(c: Context<{ Bindings: Env }>) {
    return this.fetchList(c, 'indexer.traces', 'block_number DESC', TraceSchema)
  }
}
