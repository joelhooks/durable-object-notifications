import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const preferences = sqliteTable('preferences', {
	userId: text('user_id').primaryKey(),
	defaultLevel: text('default_level'),
	emailEnabled: integer('email_enabled', { mode: 'boolean' }),
	webEnabled: integer('web_enabled', { mode: 'boolean' }),
	digestFrequency: text('digest_frequency').$type<'daily' | 'weekly'>(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }),
})

export const subscriptions = sqliteTable(
	'subscriptions',
	{
		userId: text('user_id'),
		creatorId: text('creator_id'),
		level: text('level'),
		createdAt: integer('created_at', { mode: 'timestamp' }),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.creatorId] }),
	}),
)

// Type inference helpers
export type Preference = typeof preferences.$inferSelect
export type NewPreference = typeof preferences.$inferInsert

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
