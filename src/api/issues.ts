import request from '@/utils/request'
import type { ApiResponse } from '@/types/response'

// 获取问题列表
export function getIssueList(params?: {
  keyword?: string
  status?: 'pending' | 'processing' | 'completed'
  page?: number
  pageSize?: number
}) {
  return request<ApiResponse>({
    url: '/api/issues',
    method: 'get',
    params
  })
}

// 获取问题详情
export function getIssueDetail(id: string) {
  return request<ApiResponse>({
    url: `/api/issues/${id}`,
    method: 'get'
  })
}

// 创建问题
export function createIssue(data: {
  title: string
  priority?: 'high' | 'medium' | 'low'
  status?: 'pending' | 'processing' | 'completed'
  description?: string
  deadline?: string
  assigneeId?: string
}) {
  return request<ApiResponse>({
    url: '/api/issues',
    method: 'post',
    data
  })
}

// 更新问题
export function updateIssue(id: string, data: {
  title?: string
  priority?: 'high' | 'medium' | 'low'
  status?: 'pending' | 'processing' | 'completed'
  description?: string
  deadline?: string
  assigneeId?: string
}) {
  return request<ApiResponse>({
    url: `/api/issues/${id}`,
    method: 'put',
    data
  })
}

// 添加处理记录
export function addIssueRecord(id: string, data: {
  content: string
  newStatus?: 'pending' | 'processing' | 'completed'
}) {
  return request<ApiResponse>({
    url: `/api/issues/${id}/records`,
    method: 'post',
    data
  })
}

// 获取用户列表（用于选择负责人）
export function getUserList(params?: {
  username?: string;
  role_id?: string;
  status?: string;
}) {
  return request<ApiResponse>({
    url: '/api/users',
    method: 'get',
    params
  })
} 