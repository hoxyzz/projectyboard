/**
 * Business rules for Projects domain.
 */

export const PROJECT_NAME_MAX_LENGTH = 100
export const PROJECT_KEY_MAX_LENGTH = 5

export type ValidationError = {
	field: string
	message: string
}

export type ValidationResult =
	| { valid: true }
	| { valid: false; errors: ValidationError[] }

export function validateProjectName(name: string | undefined): ValidationResult {
	const errors: ValidationError[] = []

	if (!name || name.trim().length === 0) {
		errors.push({ field: 'name', message: 'Project name is required' })
	} else if (name.length > PROJECT_NAME_MAX_LENGTH) {
		errors.push({ field: 'name', message: `Project name must be at most ${PROJECT_NAME_MAX_LENGTH} characters` })
	}

	return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export function validateProjectKey(key: string | undefined): ValidationResult {
	const errors: ValidationError[] = []

	if (key && key.length > PROJECT_KEY_MAX_LENGTH) {
		errors.push({ field: 'key', message: `Project key must be at most ${PROJECT_KEY_MAX_LENGTH} characters` })
	}

	if (key && !/^[A-Z0-9]+$/.test(key)) {
		errors.push({ field: 'key', message: 'Project key must contain only uppercase letters and numbers' })
	}

	return errors.length > 0 ? { valid: false, errors } : { valid: true }
}
