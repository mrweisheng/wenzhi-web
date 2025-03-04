import router from '@/router'
import { useUserStore } from '@/stores/user'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

router.beforeEach(async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const userStore = useUserStore()
  const hasToken = userStore.token

  if (hasToken) {
    if (to.path === '/login') {
      next('/')
    } else {
      if (!userStore.userInfo) {
        try {
          await userStore.getUserInfoAction()
          next()
        } catch (error) {
          userStore.clearAuth()
          next('/login')
        }
      } else {
        next()
      }
    }
  } else {
    if (to.path === '/login') {
      next()
    } else {
      next('/login')
    }
  }
}) 