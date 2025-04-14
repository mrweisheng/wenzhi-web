import request from '@/utils/request'
import type { Statistics } from '@/types/statistics'
import type { ApiResponse } from '@/types/response'

export function getStatistics() {
  return request<ApiResponse<Statistics>>({
    url: '/api/statistics',
    method: 'get'
  })
} 