/**
 * Shared domain types used across features.
 * Keep this file thin — domain-specific types live in their feature modules.
 */

/** Generic paginated response wrapper */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Generic async operation result */
export type AsyncResult<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

/** Callback that may be wired to a backend action later */
export type ActionCallback<TArgs = void, TResult = void> = (
  args: TArgs
) => Promise<TResult> | TResult;

/** Nullable callback — explicitly marks "not yet implemented" */
export type OptionalAction<TArgs = void, TResult = void> =
  | ActionCallback<TArgs, TResult>
  | null
  | undefined;
