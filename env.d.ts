// Custom environment variables extension
// This file extends the auto-generated worker-configuration.d.ts

declare global {
  interface Env {
    // ClickHouse connection settings
    CLICKHOUSE_URL: string
    CLICKHOUSE_USERNAME?: string
    CLICKHOUSE_PASSWORD?: string
    CLICKHOUSE_DATABASE?: string
  }
}

export { }

