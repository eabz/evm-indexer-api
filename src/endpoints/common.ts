import { getClient } from '@/db'
import { OpenAPIRoute } from 'chanfana'
import type { Context } from 'hono'
import { z } from 'zod'

// Base pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10)
})

// Common filter schemas that can be reused across endpoints
export const ChainFilterSchema = z.object({
  chain: z.coerce.number().optional().describe('Filter by chain ID')
})

export const BlockRangeFilterSchema = z.object({
  block_number: z.coerce.number().optional().describe('Filter by exact block number'),
  from_block: z.coerce.number().optional().describe('Filter from block number (inclusive)'),
  to_block: z.coerce.number().optional().describe('Filter to block number (inclusive)')
})

export const TimeRangeFilterSchema = z.object({
  from_timestamp: z.string().optional().describe('Filter from timestamp (ISO 8601 format)'),
  to_timestamp: z.string().optional().describe('Filter to timestamp (ISO 8601 format)')
})

export const AddressFilterSchema = z.object({
  address: z.string().optional().describe('Filter by address (case-insensitive)')
})

export const TransactionFilterSchema = z.object({
  transaction_hash: z.string().optional().describe('Filter by transaction hash')
})

// Filter condition type for building WHERE clauses
export interface FilterCondition {
  column: string
  param: string
  operator: '=' | '>' | '<' | '>=' | '<=' | 'IN' | 'ILIKE'
  type: string
}

// Helper to convert ISO 8601 timestamps to ClickHouse DateTime format
function normalizeTimestamp(value: string): string {
  // Remove timezone suffix (Z or +00:00) and T separator for ClickHouse compatibility
  return value
    .replace('T', ' ')
    .replace('Z', '')
    .replace(/[+-]\d{2}:\d{2}$/, '')
}

export class BaseListEndpoint extends OpenAPIRoute {
  schema = {
    request: {
      query: PaginationSchema
    }
  }

  protected buildWhereClause(
    filters: Record<string, unknown>,
    filterMapping: Record<string, FilterCondition>
  ): { whereClause: string; params: Record<string, unknown> } {
    const conditions: string[] = []
    const params: Record<string, unknown> = {}

    for (const [filterKey, condition] of Object.entries(filterMapping)) {
      const value = filters[filterKey]
      if (value === undefined || value === null || value === '') continue

      const { column, param, operator, type } = condition

      // Normalize DateTime values for ClickHouse compatibility
      let processedValue = value
      if (type === 'DateTime' && typeof value === 'string') {
        processedValue = normalizeTimestamp(value)
      }

      if (operator === 'ILIKE') {
        conditions.push(`lower(${column}) = lower({${param}:String})`)
        params[param] = processedValue
      } else if (operator === 'IN' && Array.isArray(value)) {
        conditions.push(`${column} IN ({${param}:Array(${type})})`)
        params[param] = processedValue
      } else {
        conditions.push(`${column} ${operator} {${param}:${type}}`)
        params[param] = processedValue
      }
    }

    return {
      whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      params
    }
  }

  protected async fetchList(
    c: Context<{ Bindings: Env }>,
    tableName: string,
    orderBy: string,
    _schema: z.ZodType<unknown>,
    filterMapping: Record<string, FilterCondition> = {}
  ) {
    try {
      const data = await this.getValidatedData<typeof this.schema>()
      const query = data.query as Record<string, unknown>
      const page = (query.page as number) || 1
      const limit = (query.limit as number) || 10
      const offset = (page - 1) * limit

      const { whereClause, params } = this.buildWhereClause(query, filterMapping)

      const client = getClient(c.env)

      // Get total count for pagination
      const countResult = await client.query({
        query: `SELECT count() as total FROM ${tableName} ${whereClause}`,
        query_params: params,
        format: 'JSONEachRow'
      })
      const countData = (await countResult.json()) as Array<{ total: string }>
      const total = Number(countData[0]?.total || 0)

      // Get paginated results
      const resultSet = await client.query({
        query: `SELECT * FROM ${tableName} ${whereClause} ORDER BY ${orderBy} LIMIT {limit:UInt32} OFFSET {offset:UInt32}`,
        query_params: {
          ...params,
          limit,
          offset
        },
        format: 'JSONEachRow'
      })

      const result = await resultSet.json()

      return {
        success: true,
        data: result,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
          has_next: page * limit < total,
          has_prev: page > 1
        }
      }
    } catch (error) {
      // Handle different types of errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      // Check for specific error types
      if (errorMessage.includes('Network connection lost') || errorMessage.includes('ECONNREFUSED')) {
        return c.json(
          {
            success: false,
            error: 'Database connection failed',
            message: 'Unable to connect to the database. Please check your connection settings.',
            code: 'DB_CONNECTION_ERROR'
          },
          503
        )
      }

      if (errorMessage.includes('Authentication failed')) {
        return c.json(
          {
            success: false,
            error: 'Database authentication failed',
            message: 'Invalid database credentials',
            code: 'DB_AUTH_ERROR'
          },
          500
        )
      }

      // Generic database error
      return c.json(
        {
          success: false,
          error: 'Database query failed',
          message: errorMessage,
          code: 'DB_QUERY_ERROR'
        },
        500
      )
    }
  }
}
