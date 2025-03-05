import { defineStore } from 'pinia'
import type { UserInfo } from '@/types/user'
import type { LoginResponse } from '@/types/auth'
import { getUserInfo } from '@/api/auth'
import type { Menu } from '@/types/menu'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    tokenExpires: Number(localStorage.getItem('tokenExpires')) || 0,
    userInfo: null as UserInfo | null,
    menus: [] as Menu[]
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
        const res = await getUserInfo()
        if (res.data?.data) {
          this.userInfo = res.data.data
          // 处理菜单数据，修改 path
          if (Array.isArray(res.data.data.menus)) {
            this.menus = res.data.data.menus  // 直接使用原始菜单数据，不做路径处理
          }
        }
      } catch (error) {
        console.error('Get user info error:', error)
        throw error
      }
    }
  }
}) 