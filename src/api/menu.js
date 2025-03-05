import request from '@/utils/request'

// 获取菜单列表
export function getMenus() {
  return request({
    url: '/api/menus',
    method: 'get'
  })
}

// 创建菜单
export function createMenu(data) {
  return request({
    url: '/api/menus',
    method: 'post',
    data
  })
}

// 更新菜单
export function updateMenu(id, data) {
  return request({
    url: `/api/menus/${id}`,
    method: 'put',
    data
  })
}

// 删除菜单
export function deleteMenu(id) {
  return request({
    url: `/api/menus/${id}`,
    method: 'delete'
  })
} 