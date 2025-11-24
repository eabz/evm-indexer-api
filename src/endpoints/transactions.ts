import type { Context } from 'hono'
import { z } from 'zod'
import { TransactionSchema } from '../db/schema'
import { BaseListEndpoint } from './common'

export class TransactionList extends BaseListEndpoint {
  schema = {
    summary: 'List Transactions',
    tags: ['Transactions'],
    request: {
      query: z.object({
        page: z.number().default(1),
        limit: z.number().default(10)
      })
    },
    responses: {
      '200': {
        description: 'Returns a list of transactions',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(TransactionSchema),
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
    return this.fetchList(c, 'indexer.transactions', 'timestamp DESC', TransactionSchema)
  }
}
