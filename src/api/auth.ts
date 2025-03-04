import request from '@/utils/request'
import type { LoginForm } from '@/types/auth'
import type { ApiResponse } from '@/types/response'

export function login(data: LoginForm) {
  return request<ApiResponse>({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request<ApiResponse>({
    url: '/api/auth/userInfo',
    method: 'get'
  })
} 