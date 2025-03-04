export * from './auth'
export * from './user'
export * from './role'
export * from './menu'
export * from './order'
export * from './writer'
export * from './route'
export * from './response'

export interface BaseResponse {
  code: number
  message: string
  data: any
}

export interface PageParams {
  page: number
  pageSize: number
} 