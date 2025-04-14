import request from '@/utils/request'
import type { OrderQuery } from '@/types/order'
import type { ApiResponse } from '@/types/response'

// 获取订单列表
export function getOrders(params: OrderQuery) {
  return request<ApiResponse>({
    url: '/api/orders',
    method: 'get',
    params
  })
}

// 处理订单文件
export function processOrder(data: FormData) {
  return request<ApiResponse>({
    url: '/api/orders/process',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 更新订单客服
export function updateOrderCustomer(orderId: string, data: { customer_id: number }) {
  return request<ApiResponse>({
    url: `/api/orders/${orderId}/customer`,
    method: 'put',
    data
  })
}

// 更新订单写手
export function updateOrderWriter(orderId: string, data: { writer_id: number }) {
  return request({
    url: `/api/orders/${orderId}/writer`,
    method: 'put',
    data
  })
} 