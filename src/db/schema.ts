import { z } from 'zod'

export const BlockSchema = z.object({
  base_fee_per_gas: z.number().nullable(),
  chain: z.number(),
  difficulty: z.string(),
  extra_data: z.string(),
  gas_limit: z.number(),
  gas_used: z.number(),
  hash: z.string(),
  is_uncle: z.boolean(),
  logs_bloom: z.string(),
  miner: z.string(),
  mix_hash: z.string().nullable(),
  nonce: z.string(),
  number: z.number(),
  parent_hash: z.string(),
  receipts_root: z.string(),
  sha3_uncles: z.string(),
  size: z.number(),
  state_root: z.string(),
  timestamp: z.string(), // DateTime is returned as string
  total_difficulty: z.string().nullable(),
  transactions: z.number(),
  transactions_root: z.string(),
  uncles: z.array(z.string()),
  withdrawals_root: z.string().nullable()
})

export const ContractSchema = z.object({
  block_number: z.number(),
  chain: z.number(),
  contract_address: z.string(),
  creator: z.string(),
  transaction_hash: z.string()
})

export const LogSchema = z.object({
  address: z.string(),
  block_number: z.number(),
  chain: z.number(),
  data: z.string(),
  log_index: z.number(),
  log_type: z.string().nullable(),
  removed: z.boolean(),
  timestamp: z.string(),
  topic0: z.string().nullable(),
  topic1: z.string().nullable(),
  topic2: z.string().nullable(),
  topic3: z.string().nullable(),
  transaction_hash: z.string(),
  transaction_log_index: z.number().nullable()
})

export const Erc20TransferSchema = z.object({
  address: z.string(),
  amount: z.string(),
  block_number: z.number(),
  chain: z.number(),
  from: z.string(),
  log_index: z.number(),
  log_type: z.string().nullable(),
  removed: z.boolean(),
  timestamp: z.string(),
  to: z.string(),
  token_address: z.string(),
  transaction_hash: z.string(),
  transaction_log_index: z.number().nullable()
})

export const Erc721TransferSchema = z.object({
  address: z.string(),
  block_number: z.number(),
  chain: z.number(),
  from: z.string(),
  id: z.string(),
  log_index: z.number(),
  log_type: z.string().nullable(),
  removed: z.boolean(),
  timestamp: z.string(),
  to: z.string(),
  token_address: z.string(),
  transaction_hash: z.string(),
  transaction_log_index: z.number().nullable()
})

export const Erc1155TransferSchema = z.object({
  address: z.string(),
  amounts: z.array(z.string()),
  block_number: z.number(),
  chain: z.number(),
  from: z.string(),
  ids: z.array(z.string()),
  log_index: z.number(),
  log_type: z.string().nullable(),
  operator: z.string(),
  removed: z.boolean(),
  timestamp: z.string(),
  to: z.string(),
  token_address: z.string(),
  transaction_hash: z.string(),
  transaction_log_index: z.number().nullable()
})

export const TraceSchema = z.object({
  action_type: z.string(),
  address: z.string().nullable(),
  author: z.string().nullable(),
  balance: z.string().nullable(),
  block_hash: z.string(),
  block_number: z.number(),
  call_type: z.string().nullable(),
  chain: z.number(),
  code: z.string().nullable(),
  error: z.string().nullable(),
  from: z.string().nullable(),
  gas: z.number().nullable(),
  gas_used: z.number().nullable(),
  init: z.string().nullable(),
  input: z.string().nullable(),
  output: z.string().nullable(),
  refund_address: z.string().nullable(),
  reward_type: z.string().nullable(),
  subtraces: z.number(),
  to: z.string().nullable(),
  trace_address: z.array(z.number()),
  transaction_hash: z.string().nullable(),
  transaction_position: z.number().nullable(),
  value: z.string().nullable()
})

export const TransactionSchema = z.object({
  access_list: z.array(z.tuple([z.string(), z.array(z.string())])),
  base_fee_per_gas: z.number().nullable(),
  block_hash: z.string(),
  block_number: z.number(),
  chain: z.number(),
  contract_created: z.string().nullable(),
  cumulative_gas_used: z.number().nullable(),
  effective_gas_price: z.string().nullable(),
  from: z.string(),
  gas: z.number(),
  gas_price: z.string().nullable(),
  gas_used: z.number().nullable(),
  hash: z.string(),
  input: z.string(),
  max_fee_per_gas: z.string().nullable(),
  max_priority_fee_per_gas: z.string().nullable(),
  method: z.string(),
  nonce: z.number(),
  status: z.string().nullable(),
  timestamp: z.string(),
  to: z.string(),
  transaction_index: z.number(),
  transaction_type: z.string(),
  value: z.string()
})

export const WithdrawalSchema = z.object({
  address: z.string(),
  amount: z.string(),
  block_number: z.number(),
  chain: z.number(),
  timestamp: z.string(),
  validator_index: z.number(),
  withdrawal_index: z.number()
})

export const DexTradeSchema = z.object({
  block_number: z.number(),
  chain: z.number(),
  transaction_hash: z.string(),
  log_index: z.number(),
  pool_address: z.string(),
  sender: z.string(),
  recipient: z.string(),
  amount0_in: z.string(),
  amount1_in: z.string(),
  amount0_out: z.string(),
  amount1_out: z.string(),
  dex_name: z.string(),
  timestamp: z.string()
})

export const TokenSchema = z.object({
  address: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  type: z.string(),
  chain: z.number()
})
