import { migrate } from 'drizzle-orm/durable-sqlite/migrator'
import { DrizzleDatabaseWithSchema, preferences as preferencesTable } from '../schema'
import { NotificationLevel, UserPreferences } from '../types'
import migrations from '../../drizzle/migrations'
import { eq } from 'drizzle-orm'

export class PreferencesRepository {
	constructor(private db: DrizzleDatabaseWithSchema) {}

	async init() {
		await migrate(this.db, migrations)
	}

	async findByUserId(userId: string): Promise<UserPreferences | null> {
		const result = await this.db.query.preferences.findFirst({
			where: eq(preferencesTable.userId, userId),
		})
		return result ? this.mapToPreferences(result) : null
	}

	async upsertPreferences(userId: string, preferences: UserPreferences): Promise<void> {
		const exists = await this.db.query.preferences.findFirst({
			where: eq(preferencesTable.userId, userId),
		})

		if (exists) {
			await this.db
				.update(preferencesTable)
				.set({
					defaultLevel: preferences.defaultLevel,
					emailEnabled: preferences.email,
					webEnabled: preferences.web,
					digestFrequency: preferences.digestFrequency,
					updatedAt: new Date(),
				})
				.where(eq(preferencesTable.userId, userId))
		} else {
			await this.db.insert(preferencesTable).values({
				userId,
				defaultLevel: preferences.defaultLevel,
				emailEnabled: preferences.email,
				webEnabled: preferences.web,
				digestFrequency: preferences.digestFrequency,
				updatedAt: new Date(),
			})
		}
	}

	private mapToPreferences(row: any): UserPreferences {
		return {
			userId: row.userId,
			defaultLevel: row.defaultLevel as NotificationLevel,
			email: Boolean(row.emailEnabled),
			web: Boolean(row.webEnabled),
			digestFrequency: row.digestFrequency as 'daily' | 'weekly',
		}
	}
}
