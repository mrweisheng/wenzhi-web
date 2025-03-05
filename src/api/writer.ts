import request from '@/utils/request'
import type { WriterForm, WriterQuery } from '@/types/writer'

// 获取写手列表
export function getWriters(params?: WriterQuery) {
  return request({
    url: '/api/writers',
    method: 'get',
    params
  })
}

// 获取写手详情
export function getWriter(id: number) {
  return request({
    url: `/api/writers/${id}`,
    method: 'get'
  })
}

// 新增写手
export function createWriter(data: WriterForm) {
  return request({
    url: '/api/writers',
    method: 'post',
    data
  })
}

// 更新写手
export function updateWriter(id: number, data: Partial<WriterForm>) {
  return request({
    url: `/api/writers/${id}`,
    method: 'put',
    data
  })
}

// 删除写手
export function deleteWriter(id: number) {
  return request({
    url: `/api/writers/${id}`,
    method: 'delete'
  })
}

// 批量删除写手
export function batchDeleteWriters(ids: number[]) {
  return request({
    url: '/api/writers',
    method: 'delete',
    data: { ids }
  })
}

// 写手申请
export function applyWriter(data: WriterForm) {
  return request({
    url: '/api/writer/apply',
    method: 'post',
    data
  })
}

// 生成写手申请临时令牌
export function generateApplicationToken() {
  // 简单生成一个临时令牌
  const token = `apply_${Date.now()}`
  return Promise.resolve({ data: { token } })
} 