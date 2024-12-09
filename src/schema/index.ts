import * as schema from './schema'
import { type DrizzleSqliteDODatabase } from 'drizzle-orm/durable-sqlite'

export type DrizzleDatabaseWithSchema = DrizzleSqliteDODatabase<typeof schema>
export { schema }
export * from './schema'
