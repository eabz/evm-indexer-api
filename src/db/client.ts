import { createClient } from '@clickhouse/client-web'

export const getClient = (env: Env) => {
  return createClient({
    url: env.CLICKHOUSE_HOST,
    username: env.CLICKHOUSE_USER,
    password: env.CLICKHOUSE_PASSWORD,
    database: env.CLICKHOUSE_DATABASE
  })
}
