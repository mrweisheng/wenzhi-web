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
  status: 0 | 1
  created_at: string
  updated_at: string
  menus?: Menu[]
  role?: Role
}

export interface UserQuery {
  page: number
  pageSize: number
  username?: string
  role_id?: number
  status?: 0 | 1
  startTime?: string
  endTime?: string
}

// 用户状态类型
export type UserStatus = 'active' | 'inactive' | 'locked';

// API返回的用户信息结构
export interface ApiUser {
  id: string;
  username: string;
  role_id: string;
  role_name: string;
  real_name: string;
  email: string;
  status: UserStatus;
  avatar?: string | null;
}

// 前端使用的用户信息结构
export interface User {
  id: string;
  username: string;
  realName: string;
  email: string;
  roleId: string;
  roleName: string;
  status: UserStatus;
  avatar: string | null;
}

// 转换API用户到前端用户
export function apiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    username: apiUser.username,
    realName: apiUser.real_name,
    email: apiUser.email,
    roleId: apiUser.role_id,
    roleName: apiUser.role_name,
    status: apiUser.status,
    avatar: apiUser.avatar || null
  };
}
