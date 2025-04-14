// API响应通用接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageData<T = any> {
  list: T[]
  total: number
}

export type ApiPageResponse<T = any> = ApiResponse<PageData<T>> 