/**
 * Business rules for Labels domain.
 */

export const LABEL_NAME_MAX_LENGTH = 50
export const LABEL_COLOR_REGEX = /^(#[0-9A-Fa-f]{6}|hsl\([^)]+\)|rgba?\([^)]+\))$/

export type ValidationError = {
	field: string
	message: string
}

export type ValidationResult =
	| { valid: true }
	| { valid: false; errors: ValidationError[] }

export function validateLabelName(name: string | undefined): ValidationResult {
	const errors: ValidationError[] = []

	if (!name || name.trim().length === 0) {
		errors.push({ field: 'name', message: 'Label name is required' })
	} else if (name.length > LABEL_NAME_MAX_LENGTH) {
		errors.push({ field: 'name', message: `Label name must be at most ${LABEL_NAME_MAX_LENGTH} characters` })
	}

	return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export function validateLabelColor(color: string | undefined): ValidationResult {
	const errors: ValidationError[] = []

	if (!color || color.trim().length === 0) {
		errors.push({ field: 'color', message: 'Label color is required' })
	}
	// Allow CSS color values including hsl(var(...)) patterns
	// Skip strict validation for CSS variable patterns

	return errors.length > 0 ? { valid: false, errors } : { valid: true }
}
