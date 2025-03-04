import request from '@/utils/request'
import type { OrderQuery } from '@/types/order'

// 获取订单列表
export function getOrders(params: OrderQuery) {
  return request({
    url: '/api/orders',
    method: 'get',
    params
  })
}

// 处理订单文件
export function processOrder(data: FormData) {
  return request({
    url: '/api/orders/process',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
} 