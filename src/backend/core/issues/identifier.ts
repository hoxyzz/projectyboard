/**
 * Issue identifier generation policy.
 * Handles project-scoped identifiers like "AIO-19".
 */

const DEFAULT_PROJECT_KEY = 'ISS'

/**
 * Builds a project key from a project name.
 * Takes initials from the name or uses provided preferred key.
 */
export function buildProjectKey(name: string, preferredKey?: string): string {
	const normalizedPreferred = preferredKey?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
	if (normalizedPreferred) return normalizedPreferred.slice(0, 5)

	const initials = name
		.trim()
		.split(/\s+/)
		.map((part) => part[0])
		.join('')
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, '')

	return (initials || 'PRJ').slice(0, 5)
}

/**
 * Generates a unique project key, avoiding collisions with existing keys.
 */
export function generateUniqueProjectKey(
	name: string,
	preferredKey: string | undefined,
	existingKeys: string[]
): string {
	const baseKey = buildProjectKey(name, preferredKey)
	let uniqueKey = baseKey
	let suffix = 2

	while (existingKeys.includes(uniqueKey)) {
		uniqueKey = `${baseKey.slice(0, 4)}${suffix}`
		suffix += 1
	}

	return uniqueKey
}

/**
 * Generates the next issue identifier for a project.
 * In mock implementations, this uses in-memory counters.
 * In real DB implementations, this must be transactional.
 */
export function formatIssueIdentifier(projectKey: string | undefined, counter: number): string {
	const key = projectKey || DEFAULT_PROJECT_KEY
	return `${key}-${counter}`
}
