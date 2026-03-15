/**
 * Semantic database types for type-safe branded IDs.
 * Prevents accidental mixing of different ID types.
 */

// Branded type helper
type Brand<T, B> = T & { __brand: B }

// Semantic ID types
export type ProjectId = Brand<string, 'ProjectId'>
export type IssueId = Brand<string, 'IssueId'>
export type LabelId = Brand<string, 'LabelId'>
export type ActivityId = Brand<string, 'ActivityId'>
export type UserId = Brand<string, 'UserId'>

// Type guards and constructors
export const ProjectId = (id: string): ProjectId => id as ProjectId
export const IssueId = (id: string): IssueId => id as IssueId
export const LabelId = (id: string): LabelId => id as LabelId
export const ActivityId = (id: string): ActivityId => id as ActivityId
export const UserId = (id: string): UserId => id as UserId

// UUID generators
export const newProjectId = (): ProjectId => crypto.randomUUID() as ProjectId
export const newIssueId = (): IssueId => crypto.randomUUID() as IssueId
export const newLabelId = (): LabelId => crypto.randomUUID() as LabelId
export const newActivityId = (): ActivityId => crypto.randomUUID() as ActivityId
