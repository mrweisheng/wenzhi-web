import type { RouteRecordRaw } from 'vue-router'

export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'children'> {
  children?: AppRouteRecordRaw[]
  meta?: {
    title?: string
    icon?: string
    noAuth?: boolean
    noLayout?: boolean
  }
} 