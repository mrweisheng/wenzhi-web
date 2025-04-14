import request from '@/utils/request'
import type { ApiResponse } from '@/types/response'

// 获取案例列表
export function getCaseList(params?: {
  keyword?: string
  case_type?: string
  page?: number
  pageSize?: number
}) {
  return request<ApiResponse>({
    url: '/api/cases',
    method: 'get',
    params
  })
}

// 获取案例详情
export function getCaseDetail(id: string) {
  return request<ApiResponse>({
    url: `/api/cases/${id}`,
    method: 'get'
  })
}

// 创建案例 - 支持多图片上传
export function createCase(data: FormData) {
  return request<ApiResponse>({
    url: '/api/cases',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 归档案例
export function archiveCase(id: string) {
  return request<ApiResponse>({
    url: `/api/cases/${id}/archive`,
    method: 'put'
  })
}

// 删除案例
export function deleteCase(id: string) {
  return request<ApiResponse>({
    url: `/api/cases/${id}`,
    method: 'delete'
  })
} 