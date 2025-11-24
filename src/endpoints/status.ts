import { getClient } from '@/db'
import { OpenAPIRoute } from 'chanfana'
import type { Context } from 'hono'
import { z } from 'zod'

const MONAD_RPC_URL = 'https://rpc1.monad.xyz'

const SyncStatusResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    indexed_blocks: z.number().describe('Total number of blocks in the database'),
    latest_indexed_block: z.number().nullable().describe('Most recent block number in the database'),
    chain_head_block: z.number().describe('Latest block number from the Monad RPC'),
    blocks_behind: z.number().describe('Number of blocks behind the chain head'),
    sync_percentage: z.number().describe('Percentage of chain synced'),
    is_synced: z.boolean().describe('Whether the indexer is considered synced (within 10 blocks)')
  })
})

export class SyncStatus extends OpenAPIRoute {
  schema = {
    summary: 'Get Sync Status',
    description: 'Returns the sync status of the indexer by comparing indexed blocks against the Monad chain head',
    tags: ['Utility'],
    responses: {
      '200': {
        description: 'Sync status retrieved successfully',
        content: {
          'application/json': {
            schema: SyncStatusResponseSchema
          }
        }
      }
    }
  }

  async handle(c: Context<{ Bindings: Env }>) {
    try {
      const client = getClient(c.env)

      // Get total block count and latest block number from database
      const blockStatsResult = await client.query({
        query: `SELECT
          count() as total_blocks,
          max(number) as latest_block
        FROM indexer.blocks`,
        format: 'JSONEachRow'
      })

      const blockStats = (await blockStatsResult.json()) as Array<{
        total_blocks: string
        latest_block: number | null
      }>

      const indexedBlocks = Number(blockStats[0]?.total_blocks || 0)
      const latestIndexedBlock = blockStats[0]?.latest_block ?? null

      // Get latest block from Monad RPC
      const rpcResponse = await fetch(MONAD_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      })

      if (!rpcResponse.ok) {
        throw new Error(`RPC request failed: ${rpcResponse.statusText}`)
      }

      const rpcData = (await rpcResponse.json()) as { result: string; error?: { message: string } }

      if (rpcData.error) {
        throw new Error(`RPC error: ${rpcData.error.message}`)
      }

      const chainHeadBlock = parseInt(rpcData.result, 16)

      // Calculate sync status using indexed block count
      const blocksBehind = chainHeadBlock - indexedBlocks
      const syncPercentage = chainHeadBlock > 0 ? Math.min(100, (indexedBlocks / chainHeadBlock) * 100) : 0
      const isSynced = blocksBehind <= 10

      return {
        success: true,
        data: {
          indexed_blocks: indexedBlocks,
          latest_indexed_block: latestIndexedBlock,
          chain_head_block: chainHeadBlock,
          blocks_behind: blocksBehind,
          sync_percentage: Math.round(syncPercentage * 100) / 100,
          is_synced: isSynced
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      return c.json(
        {
          success: false,
          error: 'Failed to get sync status',
          message: errorMessage
        },
        500
      )
    }
  }
}
