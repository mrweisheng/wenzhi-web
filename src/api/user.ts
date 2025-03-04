import request from '@/utils/request'
import type { UserQuery, UserForm } from '@/types/user'
import type { ApiResponse } from '@/types/response'

// 获取用户列表
export function getUsers(params: UserQuery) {
  return request<ApiResponse>({
    url: '/api/users',
    method: 'get',
    params
  })
}

// 创建用户
export function createUser(data: UserForm) {
  return request<ApiResponse>({
    url: '/api/users',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(id: number, data: Partial<UserForm>) {
  return request<ApiResponse>({
    url: `/api/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id: number) {
  return request<ApiResponse>({
    url: `/api/users/${id}`,
    method: 'delete'
  })
}

// 修改用户状态
export function updateUserStatus(id: number, data: { status: 0 | 1 }) {
  return request<ApiResponse>({
    url: `/api/users/${id}/status`,
    method: 'put',
    data
  })
} 