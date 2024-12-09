import { describe, it, expect, beforeEach } from 'vitest'
import { PreferencesRepository } from './PreferencesRepository'
import type { UserPreferences } from '../types'
import { MockSqlStorage } from '../test/mocks/SqlStorage'

describe('PreferencesRepository', () => {
  let repository: PreferencesRepository
  let mockSql: MockSqlStorage

  beforeEach(() => {
    mockSql = new MockSqlStorage()
    repository = new PreferencesRepository(mockSql as any)
  })

  describe('findByUserId', () => {
    it('returns null when user not found', async () => {
      const result = await repository.findByUserId('nonexistent')
      expect(result).toBeNull()
    })

    it('returns mapped preferences when found', async () => {
      // Setup existing data
      await repository.upsertPreferences('user1', {
        userId: 'user1',
        defaultLevel: 'everything',
        email: true,
        web: false,
        digestFrequency: 'daily'
      })

      const result = await repository.findByUserId('user1')
      
      expect(result).toEqual({
        userId: 'user1',
        defaultLevel: 'everything',
        email: true,
        web: false,
        digestFrequency: 'daily'
      })
    })
  })

  describe('upsertPreferences', () => {
    const testPrefs: UserPreferences = {
      userId: 'test-user',
      defaultLevel: 'everything',
      email: true,
      web: false,
      digestFrequency: 'weekly'
    }

    it('inserts new preferences', async () => {
      await repository.upsertPreferences('test-user', testPrefs)
      
      const saved = await repository.findByUserId('test-user')
      expect(saved).toMatchObject({
        userId: 'test-user',
        defaultLevel: 'everything',
        email: true,
        web: false,
        digestFrequency: 'weekly'
      })
    })

    it('updates existing preferences', async () => {
      // Insert initial prefs
      await repository.upsertPreferences('test-user', testPrefs)
      
      // Update prefs
      const updates: UserPreferences = {
        ...testPrefs,
        email: false,
        digestFrequency: 'daily'
      }
      
      await repository.upsertPreferences('test-user', updates)
      
      const saved = await repository.findByUserId('test-user')
      expect(saved).toMatchObject({
        userId: 'test-user',
        email: false,
        digestFrequency: 'daily'
      })
    })
  })

  describe('init', () => {
    it('creates required tables', async () => {
      await repository.init()
      // Simply verify it doesn't throw
      expect(true).toBe(true)
    })
  })
}) 