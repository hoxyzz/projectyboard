/**
 * REST API implementation of IssueService.
 *
 * Drop-in replacement for the mock — swap one line in src/services/index.ts:
 *   - createMockIssueService()  →  createApiIssueService({ baseUrl: "/api" })
 *
 * Assumes a standard REST API shape:
 *   GET    /issues?status=todo,in_progress&priority=high&search=foo
 *   GET    /issues/:id
 *   POST   /issues
 *   PATCH  /issues/:id
 *   DELETE /issues/:id
 */

import type {
  IssueService,
  Issue,
  IssueFilters,
  CreateIssueInput,
  UpdateIssueInput,
} from "../types";
import type { PaginatedResult } from "@/types";

export interface ApiIssueServiceConfig {
  /** Base URL for the issues endpoint, e.g. "/api" or "https://api.example.com" */
  baseUrl: string;
  /** Optional auth token injected per-request */
  getToken?: () => string | null;
  /** Optional custom headers */
  headers?: Record<string, string>;
}

function buildHeaders(config: ApiIssueServiceConfig): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...config.headers,
  };
  const token = config.getToken?.();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export function createApiIssueService(config: ApiIssueServiceConfig): IssueService {
  const { baseUrl } = config;

  return {
    async list(filters?: IssueFilters): Promise<PaginatedResult<Issue>> {
      const params = new URLSearchParams();
      if (filters?.status?.length) params.set("status", filters.status.join(","));
      if (filters?.priority?.length) params.set("priority", filters.priority.join(","));
      if (filters?.search) params.set("search", filters.search);
      if (filters?.projectId) params.set("projectId", filters.projectId);
      if (filters?.assigneeId) params.set("assigneeId", filters.assigneeId);

      const qs = params.toString();
      const res = await fetch(`${baseUrl}/issues${qs ? `?${qs}` : ""}`, {
        headers: buildHeaders(config),
      });
      return handleResponse<PaginatedResult<Issue>>(res);
    },

    async getById(id: string): Promise<Issue | null> {
      const res = await fetch(`${baseUrl}/issues/${id}`, {
        headers: buildHeaders(config),
      });
      if (res.status === 404) return null;
      return handleResponse<Issue>(res);
    },

    async create(input: CreateIssueInput): Promise<Issue> {
      const res = await fetch(`${baseUrl}/issues`, {
        method: "POST",
        headers: buildHeaders(config),
        body: JSON.stringify(input),
      });
      return handleResponse<Issue>(res);
    },

    async update(id: string, input: UpdateIssueInput): Promise<Issue> {
      const res = await fetch(`${baseUrl}/issues/${id}`, {
        method: "PATCH",
        headers: buildHeaders(config),
        body: JSON.stringify(input),
      });
      return handleResponse<Issue>(res);
    },

    async delete(id: string): Promise<void> {
      const res = await fetch(`${baseUrl}/issues/${id}`, {
        method: "DELETE",
        headers: buildHeaders(config),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`API error ${res.status}: ${body}`);
      }
    },
  };
}
