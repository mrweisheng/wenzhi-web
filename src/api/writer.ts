import request from '@/utils/request'
import type { WriterForm, WriterQuery } from '@/types/writer'
import type { ApiResponse } from '@/types/response'

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

// 获取写手列表（用于下拉选择）
export function getWriterList() {
  return request({
    url: '/api/writers/list',
    method: 'get'
  })
}

// 添加/更新写手评分
export function rateWriter(writerId: number, data: { score: number; comment: string }) {
  return request({
    url: `/api/writers/${writerId}/ratings`,
    method: 'post',
    data
  })
}

// 获取某日所有写手评分
export function getDailyWriterRatings(params?: { date?: string; page?: number; pageSize?: number }) {
  return request({
    url: '/api/writer-ratings/daily',
    method: 'get',
    params
  })
}

// 获取指定写手当日评分
export function getWriterTodayRating(writerId: number) {
  return request({
    url: `/api/writers/${writerId}/today-rating`,
    method: 'get'
  })
}

/**
 * 获取写手评分历史
 * @param writerId 写手ID
 * @param params 查询参数
 * @returns 评分历史数据
 */
export function getWriterRatingHistory(writerId: number | string, params?: {
  page?: number;
  pageSize?: number;
  start_date?: string;
  end_date?: string;
}) {
  return request({
    url: `/api/writers/${writerId}/ratings`,
    method: 'get',
    params
  })
} 