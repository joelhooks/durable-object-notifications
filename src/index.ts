/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/durable-sqlite'
import { DurableObject } from 'cloudflare:workers'
import { PreferencesRepository } from './db/PreferencesRepository'
import { PreferencesService } from './services/PreferencesService'
import { UserPreferencesSchema } from './types'

import { DrizzleDatabaseWithSchema, schema } from './schema'

export class PreferenceManager extends DurableObject {
	db: DrizzleDatabaseWithSchema
	private repository: PreferencesRepository
	private service: PreferencesService

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env)
		this.db = drizzle(ctx.storage, { schema })
		this.repository = new PreferencesRepository(this.db)
		this.service = new PreferencesService(this.repository)
		this.init()
	}

	private async init() {
		this.ctx.blockConcurrencyWhile(async () => {
			await this.repository.init()
		});
	}

	async getPreferences(userId: string) {
		return this.service.getPreferences(userId)
	}

	async updatePreferences(userId: string, preferences: any) {
		return this.service.updatePreferences(userId, preferences)
	}
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url)
		const userId = url.searchParams.get('userId')

		if (!userId) {
			return new Response('User ID is required', { status: 400 })
		}

		const id = env.PREFERENCES.idFromName(userId)
		const manager = env.PREFERENCES.get(id)

		if (request.method === 'GET') {
			return new Response(JSON.stringify(await manager.getPreferences(userId)), {
				headers: {
					'Content-Type': 'application/json',
				},
			})
		}

		if (request.method === 'PUT') {
			try {
				const preferences = await request.json()
				await manager.updatePreferences(userId, UserPreferencesSchema.parse(preferences))
				return new Response('updated', { status: 200 })
			} catch (error) {
				return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 })
			}
		}

		return new Response('method not allowed', { status: 405 })
	},
} satisfies ExportedHandler<Env>
