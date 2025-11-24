import type { Context } from 'hono'
import { z } from 'zod'
import { Erc1155TransferSchema, Erc20TransferSchema, Erc721TransferSchema } from '@/db'
import {
  BaseListEndpoint,
  BlockRangeFilterSchema,
  ChainFilterSchema,
  PaginationSchema,
  TimeRangeFilterSchema,
  type FilterCondition
} from '@/endpoints/common'

// Common transfer filter schema
const BaseTransferFilterSchema = PaginationSchema.merge(ChainFilterSchema)
  .merge(BlockRangeFilterSchema)
  .merge(TimeRangeFilterSchema)
  .extend({
    token_address: z.string().optional().describe('Filter by token contract address'),
    from: z.string().optional().describe('Filter by sender address'),
    to: z.string().optional().describe('Filter by recipient address'),
    transaction_hash: z.string().optional().describe('Filter by transaction hash')
  })

// ERC20 specific filter
const Erc20TransferFilterSchema = BaseTransferFilterSchema

// ERC721 specific filter with token ID
const Erc721TransferFilterSchema = BaseTransferFilterSchema.extend({
  id: z.string().optional().describe('Filter by token ID')
})

// ERC1155 specific filter with operator
const Erc1155TransferFilterSchema = BaseTransferFilterSchema.extend({
  operator: z.string().optional().describe('Filter by operator address')
})

const baseTransferFilterMapping: Record<string, FilterCondition> = {
  chain: { column: 'chain', param: 'chain', operator: '=', type: 'UInt64' },
  block_number: { column: 'block_number', param: 'block_number', operator: '=', type: 'UInt32' },
  from_block: { column: 'block_number', param: 'from_block', operator: '>=', type: 'UInt32' },
  to_block: { column: 'block_number', param: 'to_block', operator: '<=', type: 'UInt32' },
  from_timestamp: { column: 'timestamp', param: 'from_timestamp', operator: '>=', type: 'DateTime' },
  to_timestamp: { column: 'timestamp', param: 'to_timestamp', operator: '<=', type: 'DateTime' },
  token_address: { column: 'token_address', param: 'token_address', operator: 'ILIKE', type: 'String' },
  from: { column: 'from', param: 'from_addr', operator: 'ILIKE', type: 'String' },
  to: { column: 'to', param: 'to_addr', operator: 'ILIKE', type: 'String' },
  transaction_hash: { column: 'transaction_hash', param: 'transaction_hash', operator: '=', type: 'String' }
}

const erc721FilterMapping: Record<string, FilterCondition> = {
  ...baseTransferFilterMapping,
  id: { column: 'id', param: 'token_id', operator: '=', type: 'String' }
}

const erc1155FilterMapping: Record<string, FilterCondition> = {
  ...baseTransferFilterMapping,
  operator: { column: 'operator', param: 'operator', operator: 'ILIKE', type: 'String' }
}

const paginationResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  total_pages: z.number(),
  has_next: z.boolean(),
  has_prev: z.boolean()
})

export class Erc20TransferList extends BaseListEndpoint {
  schema = {
    summary: 'List ERC20 Transfers',
    description: 'Retrieve a paginated list of ERC20 token transfers with optional filters for chain, block range, time range, addresses, and token.',
    tags: ['Transfers'],
    request: {
      query: Erc20TransferFilterSchema
    },
    responses: {
      '200': {
        description: 'Returns a list of ERC20 transfers',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(Erc20TransferSchema),
              pagination: paginationResponseSchema
            })
          }
        }
      }
    }
  }

  handle(c: Context<{ Bindings: Env }>) {
    return this.fetchList(c, 'indexer.erc20_transfers', 'timestamp DESC', Erc20TransferSchema, baseTransferFilterMapping)
  }
}

export class Erc721TransferList extends BaseListEndpoint {
  schema = {
    summary: 'List ERC721 Transfers',
    description: 'Retrieve a paginated list of ERC721 (NFT) transfers with optional filters for chain, block range, time range, addresses, token, and token ID.',
    tags: ['Transfers'],
    request: {
      query: Erc721TransferFilterSchema
    },
    responses: {
      '200': {
        description: 'Returns a list of ERC721 transfers',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(Erc721TransferSchema),
              pagination: paginationResponseSchema
            })
          }
        }
      }
    }
  }

  handle(c: Context<{ Bindings: Env }>) {
    return this.fetchList(c, 'indexer.erc721_transfers', 'timestamp DESC', Erc721TransferSchema, erc721FilterMapping)
  }
}

export class Erc1155TransferList extends BaseListEndpoint {
  schema = {
    summary: 'List ERC1155 Transfers',
    description: 'Retrieve a paginated list of ERC1155 (multi-token) transfers with optional filters for chain, block range, time range, addresses, token, and operator.',
    tags: ['Transfers'],
    request: {
      query: Erc1155TransferFilterSchema
    },
    responses: {
      '200': {
        description: 'Returns a list of ERC1155 transfers',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(Erc1155TransferSchema),
              pagination: paginationResponseSchema
            })
          }
        }
      }
    }
  }

  handle(c: Context<{ Bindings: Env }>) {
    return this.fetchList(c, 'indexer.erc1155_transfers', 'timestamp DESC', Erc1155TransferSchema, erc1155FilterMapping)
  }
}
