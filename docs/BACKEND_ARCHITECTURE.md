# Backend Architecture

> Handoff document for implementing a real backend with Next.js server actions as the only transport layer, while keeping the actual business logic framework-agnostic.

## Goal

Build the backend in a way that:

- keeps the core domain reusable
- uses thin server actions only as adapters
- avoids scattered action-specific business logic
- preserves the repository boundaries already introduced in the issue domain
- gives another AI a stable pattern to continue from

This document assumes:

- current frontend is Next.js
- current state uses mock repositories
- initial scope is issues, projects, labels, and activity
- assignees are intentionally out of scope
- backend direction is `server actions + Postgres + Drizzle`

## Product Requirements

### Functional

- Create, read, update, delete issues
- Create and delete projects
- Create and delete labels
- Filter issues by:
  - status
  - priority
  - project
  - label
  - text search
- Generate project-scoped identifiers like `AIO-19`
- Record activity history for relevant issue changes

### Non-Functional

- Core logic must be framework-agnostic
- No business logic inside server actions
- No DB-specific objects leaking into UI
- Must be straightforward to test
- Must be easy to grow without action sprawl

## Recommended Direction

Use this architecture:

- `core` owns domain rules
- `application` owns use cases
- `ports` define repository interfaces
- `adapters` implement those ports
- `server actions` are only thin entrypoints

Do not do this:

- component -> random server action -> direct DB logic -> custom shaped result

Do this instead:

- component -> hook/client service -> thin server action -> use case -> repository port -> db adapter

## Architecture Overview

```text
UI Components
  -> UI hooks / client query layer
    -> thin server action adapter
      -> application use case
        -> repository ports
          -> database adapter
            -> Postgres
```

## Layer Responsibilities

### 1. Core

Owns:

- entity types
- value objects
- business rules
- identifier generation policy
- activity generation rules

Should not know about:

- Next.js
- server actions
- React
- Drizzle
- SQL
- request/response objects

### 2. Application

Owns:

- CRUD use cases
- orchestration between repositories
- cross-aggregate validation
- DTO assembly

Should not contain:

- raw SQL
- framework request parsing
- UI concerns

### 3. Ports

Own interfaces only.

Examples:

- `IssueRepository`
- `ProjectRepository`
- `LabelRepository`

### 4. Adapters

Own framework/storage-specific code.

Examples:

- mock repositories
- Drizzle repositories
- server action adapters

## Proposed Folder Structure

```text
src/
  backend/
    core/
      issues/
        entities.ts
        rules.ts
        activity.ts
        identifier.ts
      projects/
        entities.ts
        rules.ts
      labels/
        entities.ts
        rules.ts

    application/
      issues/
        create.ts
        read.ts
        update.ts
        destroy.ts
      projects/
        create.ts
        read.ts
        update.ts
        destroy.ts
      labels/
        create.ts
        read.ts
        update.ts
        destroy.ts

    ports/
      issue-repository.ts
      project-repository.ts
      label-repository.ts

    adapters/
      mock/
        issue-repository.ts
        project-repository.ts
        label-repository.ts
      db/
        drizzle/
          client.ts
          issue-repository.ts
          project-repository.ts
          label-repository.ts
      next/
        actions/
          issues.ts
          projects.ts
          labels.ts
        queries/
          issues.ts
          projects.ts
          labels.ts
```

## Core CRUD Pattern

The backend should standardize around one predictable CRUD module shape per aggregate.

For each aggregate, prefer:

- `create.ts`
- `read.ts`
- `update.ts`
- `destroy.ts`

That means:

- `src/backend/application/issues/create.ts`
- `src/backend/application/issues/read.ts`
- `src/backend/application/issues/update.ts`
- `src/backend/application/issues/destroy.ts`

And the same shape for:

- `projects`
- `labels`

### Why this shape

- prevents naming drift
- makes files discoverable
- gives future AIs a repeatable pattern
- avoids a pile of one-off action files becoming the architecture

### Suggested contents

`create.ts`

- command type
- create use case
- create-specific validation/orchestration

`read.ts`

- query types
- list/get use cases
- read mapping logic

`update.ts`

- command type
- update use case
- update-specific diff/activity logic

`destroy.ts`

- delete use case
- cleanup logic
- side effect rules for related records

## Example Pattern

### `src/backend/application/issues/create.ts`

```ts
import type { IssueRepository } from '@/backend/ports/issue-repository'
import type { ProjectRepository } from '@/backend/ports/project-repository'
import type { LabelRepository } from '@/backend/ports/label-repository'

export type CreateIssueCommand = {
  title: string
  description?: string
  status?: IssueStatus
  priority?: Priority
  projectId?: string | null
  labelIds?: string[]
}

export async function createIssue(
  deps: {
    issues: IssueRepository
    projects: ProjectRepository
    labels: LabelRepository
  },
  command: CreateIssueCommand
) {
  // 1. validate title
  // 2. resolve project if present
  // 3. resolve labels
  // 4. generate project-scoped identifier
  // 5. create issue
  // 6. create initial activity
  // 7. return stable DTO
}
```

### `src/backend/application/issues/read.ts`

```ts
import type { IssueRepository } from '@/backend/ports/issue-repository'

export type ReadIssuesQuery = {
  search?: string
  status?: IssueStatus[]
  priority?: Priority[]
  projectId?: string
  labelIds?: string[]
}

export async function readIssues(
  deps: { issues: IssueRepository },
  query: ReadIssuesQuery
) {
  return deps.issues.list(query)
}

export async function readIssueById(
  deps: { issues: IssueRepository },
  id: string
) {
  return deps.issues.getById(id)
}
```

### `src/backend/application/issues/update.ts`

```ts
export type UpdateIssueCommand = {
  title?: string
  description?: string | null
  status?: IssueStatus
  priority?: Priority
  projectId?: string | null
  labelIds?: string[]
}

export async function updateIssue(
  deps: {
    issues: IssueRepository
    projects: ProjectRepository
    labels: LabelRepository
  },
  id: string,
  command: UpdateIssueCommand
) {
  // 1. load current issue
  // 2. resolve related entities
  // 3. compute changes
  // 4. append activity
  // 5. persist updated issue
  // 6. return stable DTO
}
```

### `src/backend/application/issues/destroy.ts`

```ts
export async function destroyIssue(
  deps: { issues: IssueRepository },
  id: string
) {
  return deps.issues.delete(id)
}
```

## Domain Rules To Centralize

These rules must live in core/application, not in UI and not in server actions:

- issue identifier generation:
  - derived from project key
  - monotonically increasing per project
- project deletion behavior:
  - existing issues become unassigned from project
- label deletion behavior:
  - label removed from all issues
- activity creation rules:
  - title changed
  - description changed
  - status changed
  - priority changed
  - label added/removed
  - project changed

## Repository Contracts

Recommended backend naming:

- `IssueRepository`
- `ProjectRepository`
- `LabelRepository`

Example shape:

```ts
interface IssueRepository {
  list(query?: ReadIssuesQuery): Promise<PaginatedResult<Issue>>
  getById(id: string): Promise<Issue | null>
  create(input: CreateIssueCommand): Promise<Issue>
  update(id: string, input: UpdateIssueCommand): Promise<Issue>
  delete(id: string): Promise<void>
}

interface ProjectRepository {
  list(): Promise<Project[]>
  getById(id: string): Promise<Project | null>
  create(input: CreateProjectCommand): Promise<Project>
  delete(id: string): Promise<void>
}

interface LabelRepository {
  list(): Promise<Label[]>
  getById(id: string): Promise<Label | null>
  create(input: CreateLabelCommand): Promise<Label>
  delete(id: string): Promise<void>
}
```

## Server Action Pattern

If server actions are used, they must stay thin.

### Good

```ts
'use server'

import { createIssue } from '@/backend/application/issues/create'
import { issueRepo, projectRepo, labelRepo } from '@/backend/adapters/db/container'

export async function createIssueAction(input: CreateIssueCommand) {
  return createIssue(
    {
      issues: issueRepo,
      projects: projectRepo,
      labels: labelRepo
    },
    input
  )
}
```

### Bad

```ts
'use server'

export async function createIssueAction(formData: FormData) {
  // parse
  // validate
  // generate identifier
  // write SQL
  // create activity
  // shape UI response
}
```

If a server action grows large, the architecture has failed.

## Reads And Queries

Important clarification:

- server actions are not "always PUT requests"
- under the hood they are action posts, not RESTful PUT/PATCH
- technically they can perform reads too
- but architecturally, query logic still should not live inside the action file itself

Recommended rule:

- mutation actions call `create.ts`, `update.ts`, `destroy.ts`
- query flows call `read.ts`
- `read.ts` should be invoked either:
  - directly from server components
  - from thin read wrappers when the client truly needs them

### Preferred read pattern

```ts
// app/issues/[id]/page.tsx
import { readIssueById } from '@/backend/application/issues/read'
import { issueRepo } from '@/backend/adapters/db/container'

export default async function IssuePage() {
  const issue = await readIssueById({ issues: issueRepo }, id)
  return <IssueDetail issue={issue} />
}
```

### Acceptable thin read wrapper

```ts
'use server'

import { readIssues } from '@/backend/application/issues/read'
import { issueRepo } from '@/backend/adapters/db/container'

export async function readIssuesQuery(query: ReadIssuesQuery) {
  return readIssues({ issues: issueRepo }, query)
}
```

What should never happen:

- action file contains query building logic
- action file contains joins, filtering rules, or mapping rules
- UI calls raw DB code

## Database Recommendation

Use Postgres.

Prefer:

- Drizzle ORM for schema + query layer

Suggested tables:

- `projects`
- `issue_labels`
- `issues`
- `issue_label_assignments`
- `issue_activity`
- `project_issue_counters`

### Important DB rule

Do not compute the project counter in memory once a real DB exists.

Issue identifier generation must be atomic.

Good implementation:

- `project_issue_counters` table with transactional increment
- lock the project counter row inside a transaction

## Query Strategy

For MVP:

- `ILIKE` title
- `ILIKE` identifier
- `ILIKE` project name
- join labels for label-name search

Later:

- Postgres full-text search

## Validation Strategy

Use validation at two levels:

- transport validation:
  - zod parser around action inputs
- domain validation:
  - invariants inside use cases/core

Examples:

- title required
- title max length
- project must exist if provided
- label IDs must resolve
- deleted project cannot remain attached

## Testing Strategy

### Unit tests

Test use cases directly with fake repositories.

Must cover:

- identifier generation behavior
- project deletion unassigns issues
- label deletion removes labels from issues
- activity generation
- update behavior for title/description/status/priority/project/labels

### Integration tests

Test:

- server actions against test DB
- server-side read flows against test DB

### UI tests

Minimal smoke coverage:

- create issue
- filter issue list
- delete issue

## Implementation Phases

### Phase 1

- create `src/backend/core`
- create `src/backend/application`
- create `src/backend/ports`
- move existing mock logic toward `create/read/update/destroy.ts`
- keep mock adapter working

### Phase 2

- add Postgres + Drizzle
- implement repository adapters
- keep UI unchanged except adapter wiring

### Phase 3

- add thin server actions for mutations
- use direct server-side reads or thin read wrappers for queries

## Rules For The Next AI

- do not put business logic in server actions
- do not put query logic in server action files
- do not let UI hooks call DB code directly
- do not keep mock-only identifier logic once DB exists
- preserve repository boundaries
- use the `create.ts / read.ts / update.ts / destroy.ts` pattern consistently
- add use cases before adding more framework code

## Concrete Recommendation

For this project:

- start with `core + ports + application`
- implement `create.ts / read.ts / update.ts / destroy.ts` per aggregate
- use `server actions` only as thin adapters
- use `Postgres + Drizzle`
- keep reads and writes separated structurally

That gives:

- fast MVP path
- clean architecture
- low action sprawl
- easy continuation for another AI

