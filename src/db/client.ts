import { createClient } from '@clickhouse/client-web'

export const getClient = (env: Env) => {
  const config = {
    url: env.CLICKHOUSE_URL,
    username: env.CLICKHOUSE_USERNAME || 'default',
    password: env.CLICKHOUSE_PASSWORD || '',
    database: env.CLICKHOUSE_DATABASE || 'indexer',
    // ClickHouse Cloud requires longer timeouts due to cold starts
    request_timeout: 60000, // 60 seconds
    // Enable keep-alive for better performance
    keep_alive: {
      enabled: true
    }
  }

  return createClient(config)
}
