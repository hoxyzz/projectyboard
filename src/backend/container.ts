/**
 * Dependency Injection Container
 * 
 * This container manages the instantiation and wiring of all backend dependencies.
 * It follows the Composition Root pattern, ensuring all dependencies are resolved
 * at the application boundary.
 * 
 * Usage:
 *   import { container } from '@/backend/container';
 *   const issueUseCases = container.getIssueUseCases();
 */

import type { IssueRepository } from "./ports/issue-repository";
import type { ProjectRepository } from "./ports/project-repository";
import type { LabelRepository } from "./ports/label-repository";

// Adapters - Mock (for testing/fallback)
import { MockIssueRepository } from "./adapters/mock/issue-repository";
import { MockProjectRepository } from "./adapters/mock/project-repository";
import { MockLabelRepository } from "./adapters/mock/label-repository";

// Adapters - Database (production)
import { DbIssueRepository } from "./adapters/db/issue-repository";
import { DbProjectRepository } from "./adapters/db/project-repository";
import { DbLabelRepository } from "./adapters/db/label-repository";

// Environment check
const USE_DATABASE = process.env.DATABASE_URL !== undefined;

// Use Cases
import { CreateIssueUseCase } from "./application/issues/create";
import { ReadIssueUseCase } from "./application/issues/read";
import { UpdateIssueUseCase } from "./application/issues/update";
import { DestroyIssueUseCase } from "./application/issues/destroy";

import { CreateProjectUseCase } from "./application/projects/create";
import { ReadProjectUseCase } from "./application/projects/read";
import { DestroyProjectUseCase } from "./application/projects/destroy";

import { CreateLabelUseCase } from "./application/labels/create";
import { ReadLabelUseCase } from "./application/labels/read";
import { DestroyLabelUseCase } from "./application/labels/destroy";

// ============================================================================
// Container Types
// ============================================================================

interface IssueUseCases {
  create: CreateIssueUseCase;
  read: ReadIssueUseCase;
  update: UpdateIssueUseCase;
  destroy: DestroyIssueUseCase;
}

interface ProjectUseCases {
  create: CreateProjectUseCase;
  read: ReadProjectUseCase;
  destroy: DestroyProjectUseCase;
}

interface LabelUseCases {
  create: CreateLabelUseCase;
  read: ReadLabelUseCase;
  destroy: DestroyLabelUseCase;
}

// ============================================================================
// Container Implementation
// ============================================================================

class Container {
  // Singleton repositories (mock adapter uses in-memory state)
  private issueRepository: IssueRepository | null = null;
  private projectRepository: ProjectRepository | null = null;
  private labelRepository: LabelRepository | null = null;

  // Singleton use cases
  private issueUseCases: IssueUseCases | null = null;
  private projectUseCases: ProjectUseCases | null = null;
  private labelUseCases: LabelUseCases | null = null;

  // -------------------------------------------------------------------------
  // Repository Getters
  // -------------------------------------------------------------------------

  getIssueRepository(): IssueRepository {
    if (!this.issueRepository) {
      this.issueRepository = USE_DATABASE
        ? new DbIssueRepository()
        : new MockIssueRepository();
    }
    return this.issueRepository;
  }

  getProjectRepository(): ProjectRepository {
    if (!this.projectRepository) {
      this.projectRepository = USE_DATABASE
        ? new DbProjectRepository()
        : new MockProjectRepository();
    }
    return this.projectRepository;
  }

  getLabelRepository(): LabelRepository {
    if (!this.labelRepository) {
      this.labelRepository = USE_DATABASE
        ? new DbLabelRepository()
        : new MockLabelRepository();
    }
    return this.labelRepository;
  }

  // -------------------------------------------------------------------------
  // Use Case Getters
  // -------------------------------------------------------------------------

  getIssueUseCases(): IssueUseCases {
    if (!this.issueUseCases) {
      const issueRepo = this.getIssueRepository();
      const projectRepo = this.getProjectRepository();
      const labelRepo = this.getLabelRepository();

      this.issueUseCases = {
        create: new CreateIssueUseCase(issueRepo, projectRepo, labelRepo),
        read: new ReadIssueUseCase(issueRepo),
        update: new UpdateIssueUseCase(issueRepo, labelRepo),
        destroy: new DestroyIssueUseCase(issueRepo),
      };
    }
    return this.issueUseCases;
  }

  getProjectUseCases(): ProjectUseCases {
    if (!this.projectUseCases) {
      const projectRepo = this.getProjectRepository();
      const issueRepo = this.getIssueRepository();

      this.projectUseCases = {
        create: new CreateProjectUseCase(projectRepo),
        read: new ReadProjectUseCase(projectRepo),
        destroy: new DestroyProjectUseCase(projectRepo, issueRepo),
      };
    }
    return this.projectUseCases;
  }

  getLabelUseCases(): LabelUseCases {
    if (!this.labelUseCases) {
      const labelRepo = this.getLabelRepository();
      const issueRepo = this.getIssueRepository();

      this.labelUseCases = {
        create: new CreateLabelUseCase(labelRepo),
        read: new ReadLabelUseCase(labelRepo),
        destroy: new DestroyLabelUseCase(labelRepo, issueRepo),
      };
    }
    return this.labelUseCases;
  }

  // -------------------------------------------------------------------------
  // Testing Utilities
  // -------------------------------------------------------------------------

  /**
   * Reset all repositories and use cases.
   * Useful for testing to ensure a clean state.
   */
  reset(): void {
    this.issueRepository = null;
    this.projectRepository = null;
    this.labelRepository = null;
    this.issueUseCases = null;
    this.projectUseCases = null;
    this.labelUseCases = null;
  }

  /**
   * Override repositories for testing.
   * Allows injecting mock implementations.
   */
  setRepositories(repos: {
    issue?: IssueRepository;
    project?: ProjectRepository;
    label?: LabelRepository;
  }): void {
    if (repos.issue) this.issueRepository = repos.issue;
    if (repos.project) this.projectRepository = repos.project;
    if (repos.label) this.labelRepository = repos.label;
    
    // Clear use cases so they get recreated with new repos
    this.issueUseCases = null;
    this.projectUseCases = null;
    this.labelUseCases = null;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const container = new Container();

// Re-export types for convenience
export type { IssueUseCases, ProjectUseCases, LabelUseCases };
