/**
 * Backend Module
 * 
 * This is the main entry point for the backend architecture.
 * It exports all public APIs for use in the application.
 * 
 * Architecture Layers:
 * - Core: Domain entities, business rules, and activity tracking
 * - Ports: Repository interfaces (abstractions)
 * - Application: Use cases implementing business logic
 * - Adapters: Concrete implementations of ports (mock, database, etc.)
 * - Actions: Next.js Server Actions for client interaction
 * - Container: Dependency injection and wiring
 */

// Core domain exports
export * from "./core";

// Port interfaces
export * from "./ports";

// Application use cases
export * from "./application";

// Server actions (main API for client components)
export * from "./actions";

// Container for dependency injection
export { container } from "./container";
export type { IssueUseCases, ProjectUseCases, LabelUseCases } from "./container";
