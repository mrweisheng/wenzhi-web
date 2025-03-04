export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResponse<T = any> {
  list: T[]
  total: number
}

export interface ApiPageResponse<T = any> extends ApiResponse {
  data: PageResponse<T>
} 