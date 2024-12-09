import { UserPreferences, UserPreferencesSchema } from '../types'
import { PreferencesRepository } from '../db/PreferencesRepository'
import { PreferenceError } from '../errors'

export class PreferencesService {
	constructor(private repository: PreferencesRepository) {}

	async getPreferences(userId: string): Promise<UserPreferences> {
		const preferences = await this.repository.findByUserId(userId)
		return preferences ?? this.getDefaults(userId)
	}

	async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
		if (!userId?.trim()) {
			throw new PreferenceError('Invalid user ID', 'INVALID_USER_ID')
		}

		try {
			UserPreferencesSchema.partial().parse(preferences)
		} catch (error) {
			throw new PreferenceError('Invalid preferences format', 'INVALID_FORMAT')
		}

		const current = await this.getPreferences(userId)
		const updated = { ...current, ...preferences }

		try {
			await this.repository.upsertPreferences(userId, updated)
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			throw new Error(`Failed to update preferences: ${errorMessage}`)
		}
	}

	private getDefaults(userId: string): UserPreferences {
		return {
			userId,
			defaultLevel: 'everything',
			email: true,
			web: true,
		}
	}
}
