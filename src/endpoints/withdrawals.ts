import type { Context } from 'hono'
import { z } from 'zod'
import { WithdrawalSchema } from '@/db'
import { BaseListEndpoint } from '@/endpoints/common'

export class WithdrawalList extends BaseListEndpoint {
  schema = {
    summary: 'List Withdrawals',
    tags: ['Withdrawals'],
    request: {
      query: z.object({
        page: z.number().default(1),
        limit: z.number().default(10)
      })
    },
    responses: {
      '200': {
        description: 'Returns a list of withdrawals',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(WithdrawalSchema),
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
    return this.fetchList(c, 'indexer.withdrawals', 'timestamp DESC', WithdrawalSchema)
  }
}
