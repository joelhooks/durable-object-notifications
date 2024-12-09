import { PreferenceManager } from './index'
import { UserPreferencesSchema } from './types'

export class PreferenceHandler {
	static async handleRequest(request: Request, env: Env, userId: string): Promise<Response> {
		const id = env.PREFERENCES.idFromName(userId)
		const stub = env.PREFERENCES.get(id)

		switch (request.method) {
			case 'GET':
				return this.handleGet(stub, userId)
			case 'PUT':
				return this.handlePut(request, stub, userId)
			default:
				return new Response('method not allowed', { status: 405 })
		}
	}

	private static async handleGet(stub: DurableObjectStub, userId: string): Promise<Response> {
		const prefs = await stub.fetch(`/internal/preferences/${userId}`)
		return new Response(await prefs.text(), {
			headers: { 'Content-Type': 'application/json' },
		})
	}

	private static async handlePut(request: Request, stub: DurableObjectStub, userId: string): Promise<Response> {
		try {
			const preferences = await request.json()
			UserPreferencesSchema.parse(preferences)

			const response = await stub.fetch(`/internal/preferences/${userId}`, {
				method: 'PUT',
				body: JSON.stringify(preferences),
			})

			return new Response('updated', { status: response.status })
		} catch (error) {
			return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Invalid request' }), { status: 400 })
		}
	}
}
