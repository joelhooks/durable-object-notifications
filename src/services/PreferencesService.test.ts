import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PreferencesService } from './PreferencesService'
import { PreferencesRepository } from '../db/PreferencesRepository'
import { PreferenceError } from '../errors'
import type { UserPreferences } from '../types'

describe('PreferencesService', () => {
	let service: PreferencesService
	let mockRepository: PreferencesRepository

	beforeEach(() => {
		mockRepository = {
			findByUserId: vi.fn(),
			upsertPreferences: vi.fn(),
		} as unknown as PreferencesRepository

		service = new PreferencesService(mockRepository)
	})

	describe('getPreferences', () => {
		it('returns existing preferences when found', async () => {
			const mockPrefs: UserPreferences = {
				userId: 'user1',
				defaultLevel: 'everything',
				email: false,
				web: true,
			}

			vi.mocked(mockRepository.findByUserId).mockResolvedValue(mockPrefs)

			const result = await service.getPreferences('user1')
			expect(result).toEqual(mockPrefs)
			expect(mockRepository.findByUserId).toHaveBeenCalledWith('user1')
		})

		it('returns defaults when no preferences exist', async () => {
			vi.mocked(mockRepository.findByUserId).mockResolvedValue(null)

			const result = await service.getPreferences('user1')
			expect(result).toEqual({
				userId: 'user1',
				defaultLevel: 'everything',
				email: true,
				web: true,
			})
		})
	})

	describe('updatePreferences', () => {
		it('updates existing preferences', async () => {
			const existingPrefs: UserPreferences = {
				userId: 'user1',
				defaultLevel: 'everything',
				email: true,
				web: true,
			}

			const updates = {
				email: false,
			}

			vi.mocked(mockRepository.findByUserId).mockResolvedValue(existingPrefs)

			await service.updatePreferences('user1', updates)

			expect(mockRepository.upsertPreferences).toHaveBeenCalledWith('user1', {
				...existingPrefs,
				email: false,
			})
		})

		it('throws on invalid userId', async () => {
			await expect(service.updatePreferences('', { email: false })).rejects.toThrow(PreferenceError)
		})

		it('throws on invalid preference format', async () => {
			await expect(
				service.updatePreferences('user1', {
					defaultLevel: 'invalid_level' as any,
				}),
			).rejects.toThrow(PreferenceError)
		})

		it('propagates repository errors', async () => {
			vi.mocked(mockRepository.findByUserId).mockResolvedValue(null)
			vi.mocked(mockRepository.upsertPreferences).mockRejectedValue(new Error('DB Error'))

			await expect(service.updatePreferences('user1', { email: false })).rejects.toThrow('Failed to update preferences: DB Error')
		})
	})
})
