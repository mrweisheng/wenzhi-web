import request from '@/utils/request'
import type { MenuForm } from '@/types/menu'

// 获取菜单列表
export function getMenus() {
  return request({
    url: '/api/menus',
    method: 'get'
  })
}

// 创建菜单
export function createMenu(data: MenuForm) {
  return request({
    url: '/menus',
    method: 'post',
    data
  })
}

// 更新菜单
export function updateMenu(id: number, data: Partial<MenuForm>) {
  return request({
    url: `/menus/${id}`,
    method: 'put',
    data
  })
}

// 删除菜单
export function deleteMenu(id: number) {
  return request({
    url: `/menus/${id}`,
    method: 'delete'
  })
} 