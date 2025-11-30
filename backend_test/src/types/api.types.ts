// Tipos genéricos de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}