import { defineStore } from 'pinia'
import type { UserInfo } from '@/types/user'
import type { LoginResponse } from '@/types/auth'
import { getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    tokenExpires: Number(localStorage.getItem('tokenExpires')) || 0,
    userInfo: null as UserInfo | null
  }),
  
  actions: {
    setToken(token: string, refreshToken: string, expires: number) {
      this.token = token
      this.refreshToken = refreshToken
      this.tokenExpires = expires
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('tokenExpires', expires.toString())
    },
    
    setUserInfo(info: UserInfo) {
      this.userInfo = info
    },
    
    clearAuth() {
      this.token = ''
      this.refreshToken = ''
      this.tokenExpires = 0
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tokenExpires')
    },
    
    async getUserInfoAction() {
      try {
        const { data } = await getUserInfo()
        this.setUserInfo(data.data as UserInfo)
      } catch (error) {
        this.clearAuth()
        throw error
      }
    }
  }
}) 