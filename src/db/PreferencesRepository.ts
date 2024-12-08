import { NotificationLevel, UserPreferences } from '../types';

export class PreferencesRepository {
  constructor(private sql: SqlStorage) {}

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

      CREATE TABLE IF NOT EXISTS subscriptions (
        user_id TEXT,
        creator_id TEXT,
        level TEXT,
        created_at INTEGER,
        PRIMARY KEY (user_id, creator_id)
      );
    `);
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const result = Array.from(this.sql.exec(`SELECT * FROM preferences WHERE user_id = ?`, userId));
    return result.length ? this.mapToPreferences(result[0]) : null;
  }

  async upsertPreferences(userId: string, preferences: UserPreferences): Promise<void> {
    const params = [
      preferences.defaultLevel,
      Number(preferences.email),
      Number(preferences.web),
      preferences.digestFrequency || 'daily',
      Date.now()
    ];

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
} 