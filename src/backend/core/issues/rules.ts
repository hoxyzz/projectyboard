/**
 * Business rules for Issues domain.
 * Validation logic that must be enforced regardless of transport layer.
 */

import type { IssueStatus, Priority } from './entities'

export const ISSUE_TITLE_MAX_LENGTH = 500
export const ISSUE_DESCRIPTION_MAX_LENGTH = 10000

export const VALID_STATUSES: IssueStatus[] = ['backlog', 'todo', 'in_progress', 'done', 'cancelled']
export const VALID_PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low', 'none']

export type ValidationError = {
	field: string
	message: string
}

export type ValidationResult =
	| { valid: true }
	| { valid: false; errors: ValidationError[] }

export function validateTitle(title: string | undefined): ValidationResult {
	const errors: ValidationError[] = []

	if (!title || title.trim().length === 0) {
		errors.push({ field: 'title', message: 'Title is required' })
	} else if (title.length > ISSUE_TITLE_MAX_LENGTH) {
		errors.push({ field: 'title', message: `Title must be at most ${ISSUE_TITLE_MAX_LENGTH} characters` })
	}

	return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export function validateDescription(description: string | undefined | null): ValidationResult {
	const errors: ValidationError[] = []

	if (description && description.length > ISSUE_DESCRIPTION_MAX_LENGTH) {
		errors.push({ field: 'description', message: `Description must be at most ${ISSUE_DESCRIPTION_MAX_LENGTH} characters` })
	}

	return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export function validateStatus(status: string | undefined): ValidationResult {
	const errors: ValidationError[] = []

	if (status && !VALID_STATUSES.includes(status as IssueStatus)) {
		errors.push({ field: 'status', message: `Status must be one of: ${VALID_STATUSES.join(', ')}` })
	}

	return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export function validatePriority(priority: string | undefined): ValidationResult {
	const errors: ValidationError[] = []

	if (priority && !VALID_PRIORITIES.includes(priority as Priority)) {
		errors.push({ field: 'priority', message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` })
	}

	return errors.length > 0 ? { valid: false, errors } : { valid: true }
}

export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
	const errors: ValidationError[] = []

	for (const result of results) {
		if (!result.valid) {
			errors.push(...result.errors)
		}
	}

	return errors.length > 0 ? { valid: false, errors } : { valid: true }
}
