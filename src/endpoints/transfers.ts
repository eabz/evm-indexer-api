import type { Context } from 'hono'
import { z } from 'zod'
import { Erc1155TransferSchema, Erc20TransferSchema, Erc721TransferSchema } from '../db/schema'
import { BaseListEndpoint } from './common'

export class Erc20TransferList extends BaseListEndpoint {
  schema = {
    summary: 'List ERC20 Transfers',
    tags: ['Transfers'],
    request: {
      query: z.object({
        page: z.number().default(1),
        limit: z.number().default(10)
      })
    },
    responses: {
      '200': {
        description: 'Returns a list of ERC20 transfers',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(Erc20TransferSchema),
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
    return this.fetchList(c, 'indexer.erc20_transfers', 'timestamp DESC', Erc20TransferSchema)
  }
}

export class Erc721TransferList extends BaseListEndpoint {
  schema = {
    summary: 'List ERC721 Transfers',
    tags: ['Transfers'],
    request: {
      query: z.object({
        page: z.number().default(1),
        limit: z.number().default(10)
      })
    },
    responses: {
      '200': {
        description: 'Returns a list of ERC721 transfers',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(Erc721TransferSchema),
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
    return this.fetchList(c, 'indexer.erc721_transfers', 'timestamp DESC', Erc721TransferSchema)
  }
}

export class Erc1155TransferList extends BaseListEndpoint {
  schema = {
    summary: 'List ERC1155 Transfers',
    tags: ['Transfers'],
    request: {
      query: z.object({
        page: z.number().default(1),
        limit: z.number().default(10)
      })
    },
    responses: {
      '200': {
        description: 'Returns a list of ERC1155 transfers',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(Erc1155TransferSchema),
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
    return this.fetchList(c, 'indexer.erc1155_transfers', 'timestamp DESC', Erc1155TransferSchema)
  }
}
