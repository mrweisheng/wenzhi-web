import request from '@/utils/request'

// 获取角色列表
export function getRoles() {
  return request({
    url: '/api/roles',
    method: 'get'
  })
}

// 创建角色
export function createRole(data) {
  return request({
    url: '/api/roles',
    method: 'post',
    data
  })
}

// 更新角色
export function updateRole(id, data) {
  return request({
    url: `/api/roles/${id}`,
    method: 'put',
    data
  })
}

// 删除角色
export function deleteRole(id) {
  return request({
    url: `/api/roles/${id}`,
    method: 'delete'
  })
}

// 获取角色菜单权限
export function getRoleMenus(roleId) {
  return request({
    url: `/api/roles/${roleId}/menus`,
    method: 'get'
  })
}

// 其他接口... 