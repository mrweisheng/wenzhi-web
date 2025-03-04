import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types/user'
import type { LoginResponse } from '@/types/auth'
import { getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    refreshToken: '',
    tokenExpires: 0,
    userInfo: null as UserInfo | null
  }),
  actions: {
    async getUserInfoAction() {
      const { data } = await getUserInfo()
      this.setUserInfo(data as UserInfo)
    },
    setUserInfo(info: UserInfo) {
      this.userInfo = info
    }
  }
}) 