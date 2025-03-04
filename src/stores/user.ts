import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '../types/user'
import { getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const tokenExpires = ref(Number(localStorage.getItem('tokenExpires')) || 0)
  const userInfo = ref<UserInfo | null>(null)

  function setToken(accessToken: string, refresh: string, expires: number) {
    token.value = accessToken
    refreshToken.value = refresh
    tokenExpires.value = expires
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', refresh)
    localStorage.setItem('tokenExpires', expires.toString())
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }

  function clearAuth() {
    token.value = ''
    refreshToken.value = ''
    tokenExpires.value = 0
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tokenExpires')
  }

  // 获取用户信息的方法
  async function getUserInfoAction() {
    try {
      const res = await getUserInfo()
      setUserInfo(res.data)
      return res.data
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  return {
    token,
    refreshToken,
    tokenExpires,
    userInfo,
    setToken,
    setUserInfo,
    clearAuth,
    getUserInfoAction
  }
}) 