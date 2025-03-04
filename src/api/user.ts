import request from '@/utils/request'
import type { UserForm } from '@/types/user'

// 获取用户列表
export function getUsers() {
  return request({
    url: '/api/users',
    method: 'get'
  })
}

// 创建用户
export function createUser(data: UserForm) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(id: number, data: Partial<UserForm>) {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id: number) {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

// 修改用户状态
export function updateUserStatus(id: number, status: number) {
  return request({
    url: `/users/${id}/status`,
    method: 'put',
    data: { status }
  })
} 