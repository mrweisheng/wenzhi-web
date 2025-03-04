export interface LoginForm {
  username: string
  password: string
}

export interface Menu {
  id: number
  name: string
  path: string
  icon: string
  sort: number
  parent_id: number | null
  children?: Menu[]
}

export interface Role {
  id: number
  role_name: string
}

export interface UserForm {
  id?: number
  username: string
  password?: string
  role_id: number
  real_name?: string | null
  email?: string | null
  status: number
}

export interface UserInfo {
  id: number
  username: string
  role_id: number
  real_name: string | null
  email: string | null
  status: number
  role?: Role
  menus?: Menu[]
  created_at: string
  updated_at: string
}

export interface UserQuery {
  username?: string
  role_id?: number
  status?: number
  page: number
  pageSize: number
}
