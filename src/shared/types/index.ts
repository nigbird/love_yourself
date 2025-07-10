// This file can be used for shared types that don't belong to a specific domain entity.
// For example, API response formats or utility types.

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error?: string;
}
