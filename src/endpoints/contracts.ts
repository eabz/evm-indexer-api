import type { Context } from 'hono'
import { z } from 'zod'
import { ContractSchema } from '../db/schema'
import { BaseListEndpoint } from './common'

export class ContractList extends BaseListEndpoint {
  schema = {
    summary: 'List Contracts',
    tags: ['Contracts'],
    request: {
      query: z.object({
        page: z.number().default(1),
        limit: z.number().default(10)
      })
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
                limit: z.number()
              })
            })
          }
        }
      }
    }
  }

  handle(c: Context<{ Bindings: Env }>) {
    return this.fetchList(c, 'indexer.contracts', 'block_number DESC', ContractSchema)
  }
}
