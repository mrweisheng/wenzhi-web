import type { LoginForm as AuthLoginForm } from './auth'
import type { Role as UserRole, Menu as UserMenu } from './user'
import type { Role as SystemRole } from './role'
import type { Menu as SystemMenu } from './menu'

export {
  AuthLoginForm as LoginForm,
  UserRole,
  UserMenu,
  SystemRole as Role,
  SystemMenu as Menu
}

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