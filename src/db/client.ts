import { createClient } from '@clickhouse/client-web'

export const getClient = (env: Env) => {
  return createClient({
    url: env.CLICKHOUSE_URL
  })
}
