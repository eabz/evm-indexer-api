import type { Context } from 'hono'
import { z } from 'zod'
import { LogSchema } from '../db/schema'
import { BaseListEndpoint } from './common'

export class LogList extends BaseListEndpoint {
  schema = {
    summary: 'List Logs',
    tags: ['Logs'],
    request: {
      query: z.object({
        page: z.number().default(1),
        limit: z.number().default(10)
      })
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
                limit: z.number()
              })
            })
          }
        }
      }
    }
  }

  handle(c: Context<{ Bindings: Env }>) {
    return this.fetchList(c, 'indexer.logs', 'timestamp DESC', LogSchema)
  }
}
