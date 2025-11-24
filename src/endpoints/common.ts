import { OpenAPIRoute } from 'chanfana'
import type { Context } from 'hono'
import { z } from 'zod'
import { getClient } from '@/db'

export const PaginationSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10)
})

export class BaseListEndpoint extends OpenAPIRoute {
  schema = {
    request: {
      query: PaginationSchema
    }
  }

  protected async fetchList(
    c: Context<{ Bindings: Env }>,
    tableName: string,
    orderBy: string,
    _schema: z.ZodType<unknown>
  ) {
    const data = (await this.getValidatedData<typeof this.schema>()) as { query: z.infer<typeof PaginationSchema> }
    const { page, limit } = data.query
    const offset = (page - 1) * limit

    const client = getClient(c.env)
    const resultSet = await client.query({
      query: `SELECT * FROM ${tableName} ORDER BY ${orderBy} LIMIT {limit:UInt32} OFFSET {offset:UInt32}`,
      query_params: {
        limit: limit,
        offset: offset
      },
      format: 'JSONEachRow'
    })

    const result = await resultSet.json()
    return {
      success: true,
      data: result,
      pagination: {
        page,
        limit
      }
    }
  }
}
