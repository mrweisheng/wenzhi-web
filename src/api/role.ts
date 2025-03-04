import request from '@/utils/request'
import type { RoleForm } from '@/types/role'

// 获取角色列表
export function getRoles() {
  return request({
    url: '/api/roles',
    method: 'get'
  })
}

export function createRole(data: RoleForm) {
  return request({
    url: '/roles',
    method: 'post',
    data
  })
}

export function updateRole(id: number, data: Partial<RoleForm>) {
  return request({
    url: `/roles/${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id: number) {
  return request({
    url: `/roles/${id}`,
    method: 'delete'
  })
}

export function getRoleMenus(id: number) {
  return request({
    url: `/roles/${id}/menus`,
    method: 'get'
  })
} 