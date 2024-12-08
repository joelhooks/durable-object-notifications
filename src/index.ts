import { DurableObject } from "cloudflare:workers";

type NotificationLevel = 'everything' | 'digest' | 'quiet';

import { z } from 'zod';
import { PreferenceError } from "./errors"

const UserPreferencesSchema = z.object({
  userId: z.string(),
  defaultLevel: z.enum(['everything', 'digest', 'quiet']),
  email: z.boolean(),
  web: z.boolean(),
  digestFrequency: z.enum(['daily', 'weekly']).optional()
});

type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export class PreferenceManager extends DurableObject {
	private sql = this.ctx.storage.sql;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.sql = ctx.storage.sql;  
		this.init();
	}

  async init() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS preferences (
        user_id TEXT PRIMARY KEY,
        default_level TEXT,
        email_enabled INTEGER,
        web_enabled INTEGER,
        digest_frequency TEXT,
        updated_at INTEGER
      );

      -- Start simple with basic subscriptions
      CREATE TABLE IF NOT EXISTS subscriptions (
        user_id TEXT,
        creator_id TEXT,
        level TEXT,
        created_at INTEGER,
        PRIMARY KEY (user_id, creator_id)
      );
    `);
  }

	async getPreferences(userId: string) {
		const result = Array.from(this.sql.exec(`SELECT * FROM preferences WHERE user_id = ?`, userId));

		return result.length ? this.mapToPreferences(result[0]) : this.getDefaults(userId);
	}

	private mapToPreferences(row: any): UserPreferences {
		return {
			userId: row.user_id,
			defaultLevel: row.default_level as NotificationLevel,
			email: row.email_enabled === 1,
			web: row.web_enabled === 1,
			digestFrequency: row.digest_frequency as 'daily' | 'weekly',
		};
	}

	private getDefaults(userId: string): UserPreferences {
		return {
			userId,
			defaultLevel: 'everything',
			email: true,
			web: true,
		};
	}

  async updatePreferences(
    userId: string, 
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    if (!userId?.trim()) {
      throw new PreferenceError('Invalid user ID', 'INVALID_USER_ID');
    }

    try {
      UserPreferencesSchema.partial().parse(preferences);
    } catch (error) {
      throw new PreferenceError('Invalid preferences format', 'INVALID_FORMAT');
    }

    const current = await this.getPreferences(userId);
    const updated = { ...current, ...preferences };

    const params = [
      updated.defaultLevel,
      Number(updated.email),
      Number(updated.web),
      updated.digestFrequency || 'daily',
      Date.now()
    ];

    try {
      const exists = this.sql.exec(
        "SELECT 1 FROM preferences WHERE user_id = ?", 
        userId
      ).toArray().length > 0;

      this.sql.exec(
        exists 
          ? `UPDATE preferences 
             SET default_level = ?,
                 email_enabled = ?,
                 web_enabled = ?,
                 digest_frequency = ?,
                 updated_at = ?
             WHERE user_id = ?`
          : `INSERT INTO preferences (
               default_level,
               email_enabled,
               web_enabled,
               digest_frequency,
               updated_at,
               user_id
             ) VALUES (?, ?, ?, ?, ?, ?)`,
        ...params,
        userId
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update preferences: ${errorMessage}`);
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

		const userId = url.searchParams.get("userId");

		if (!userId) {
			return new Response("User ID is required", { status: 400 });
		}

		const id = env.PREFERENCES.idFromName(userId);
		const manager = env.PREFERENCES.get(id);

		if (request.method === 'GET') {
			return new Response(
				JSON.stringify(await manager.getPreferences(userId)),
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			)
		}

		if (request.method === 'PUT') {
			try {
				const preferences = await request.json();
				await manager.updatePreferences(userId, UserPreferencesSchema.parse(preferences));
				return new Response('updated', { status: 200 });
			} catch (error) {
				return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
			}
		}

		return new Response('method not allowed', { status: 405 });
  },
} satisfies ExportedHandler<Env>;
