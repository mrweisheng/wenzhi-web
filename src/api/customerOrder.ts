import request from '@/utils/request'
import type { CustomerOrder, CustomerOrderResponse, CustomerOrderQuery } from '@/types/customerOrder'
import type { ApiResponse } from '@/types/response'

// 创建客服订单
export function createCustomerOrder(data: CustomerOrder) {
  return request<ApiResponse<CustomerOrderResponse>>({
    url: '/api/customer-orders',
    method: 'post',
    data
  })
}

// 获取客服订单列表
export function getCustomerOrders(params: CustomerOrderQuery) {
  return request<ApiResponse>({
    url: '/api/customer-orders',
    method: 'get',
    params
  })
}

// 合并客服订单到总表
export function mergeCustomerOrders() {
  return request<ApiResponse>({
    url: '/api/customer-orders/merge',
    method: 'post'
  })
} 