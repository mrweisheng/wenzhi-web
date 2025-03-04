import type { Menu } from './menu'

export interface LoginForm {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  expires: number
  userInfo: {
    id: number
    username: string
    role_id: number
    status: 0 | 1
    menus: Menu[]
  }
} 