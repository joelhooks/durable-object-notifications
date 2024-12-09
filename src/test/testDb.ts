import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '../schema/schema'

export function createTestDb() {
	const sqlite = new Database(':memory:')
	const db = drizzle(sqlite, { schema })

	migrate(db, { migrationsFolder: './drizzle' })

	return db
}
