// packages/shared/src/types/cross-cutting.ts
export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface DateRange {
  desde: Date;
  hasta: Date;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}