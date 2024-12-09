export class PreferenceError extends Error {
	constructor(
		message: string,
		public code: string,
	) {
		super(message)
		this.name = 'PreferenceError'
	}
}
