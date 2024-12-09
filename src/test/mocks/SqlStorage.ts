interface DbRow {
  user_id: string
  default_level: string
  email_enabled: number
  web_enabled: number
  digest_frequency: string
  updated_at: number
}

export class MockQueryResult {
  constructor(private rows: any[]) {}

  toArray(): any[] {
    return this.rows
  }

  *[Symbol.iterator]() {
    yield* this.rows
  }
}

export class MockSqlStorage {
  private data: DbRow[] = []

  exec(sql: string, ...params: any[]): MockQueryResult {
    if (sql.includes('INSERT INTO preferences')) {
      this.data.push({
        user_id: params[5],
        default_level: params[0],
        email_enabled: params[1],
        web_enabled: params[2],
        digest_frequency: params[3],
        updated_at: params[4]
      })
      return new MockQueryResult([])
    }

    if (sql.includes('UPDATE preferences')) {
      const userId = params[5]
      const index = this.data.findIndex(row => row.user_id === userId)
      if (index !== -1) {
        this.data[index] = {
          user_id: userId,
          default_level: params[0],
          email_enabled: params[1],
          web_enabled: params[2],
          digest_frequency: params[3],
          updated_at: params[4]
        }
      }
      return new MockQueryResult([])
    }
    
    if (sql.includes('SELECT * FROM preferences')) {
      const userId = params[0]
      const found = this.data.filter(row => row.user_id === userId)
      return new MockQueryResult(found)
    }

    if (sql.includes('SELECT 1 FROM preferences')) {
      const userId = params[0]
      const exists = this.data.some(row => row.user_id === userId)
      return new MockQueryResult(exists ? [{ '1': 1 }] : [])
    }

    return new MockQueryResult([])
  }
} 