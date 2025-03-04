import request from '@/utils/request'
import type { LoginForm } from '@/types/auth'

export function login(data: LoginForm) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request({
    url: '/api/auth/userInfo',
    method: 'get'
  })
} 