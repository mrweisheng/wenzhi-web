import { createRouter, createWebHistory } from 'vue-router'
import type { AppRouteRecordRaw } from '@/types/route'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 基础路由
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: {
      noAuth: true,
      noLayout: true
    }
  },
  {
    path: '/writer-application',
    name: 'WriterApplication',
    component: () => import('@/views/writer-application/index.vue'),
    meta: { 
      title: '写手申请',
      noAuth: true,
      noLayout: true
    }
  },
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/users/index.vue')
      },
      {
        path: 'writers',
        name: 'Writers',
        component: () => import('../views/writers/index.vue')
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('../views/roles/index.vue')
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('../views/tasks/index.vue')
      },
      {
        path: 'finance',
        name: 'Finance',
        component: () => import('../views/finance/index.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/profile/index.vue')
      },
      {
        path: 'system/menus',
        name: 'Menus',
        component: () => import('../views/system/menus/index.vue')
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/orders/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes as RouteRecordRaw[]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 检查是否需要登录
  if (to.meta?.noAuth) {
    next()
    return
  }
  
  if (!userStore.token && to.path !== '/login') {
    next('/login')
    return
  }

  // 已登录状态访问登录页，重定向到首页
  if (userStore.token && to.path === '/login') {
    next('/')
    return
  }

  // 检查token是否过期
  if (userStore.token && userStore.tokenExpires < Date.now()) {
    userStore.clearAuth()
    next('/login')
    ElMessage.error('登录已过期，请重新登录')
    return
  }

  // 如果已登录但没有用户信息，先获取用户信息
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.getUserInfoAction()
    } catch (error) {
      userStore.clearAuth()
      next('/login')
      ElMessage.error('获取用户信息失败，请重新登录')
      return
    }
  }

  next()
})

export default router 