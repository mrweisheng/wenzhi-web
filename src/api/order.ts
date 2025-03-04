import request from '@/utils/request'
import type { OrderQuery, ProcessOrderResponse } from '@/types/order'

// 获取订单列表
export function getOrders(params?: OrderQuery) {
  return request({
    url: '/api/orders',
    method: 'get',
    params
  })
}

// 处理订单数据
export function processOrder(channel: string, orderFile: File, refundOrderFile?: File) {
  const formData = new FormData()
  formData.append('channel', channel)
  formData.append('order_file', orderFile)
  if (refundOrderFile) {
    formData.append('refund_order_file', refundOrderFile)
  }

  return request<ProcessOrderResponse>({
    url: 'http://localhost:5000/process_order',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    baseURL: '',
    timeout: 30000  // 设置 30 秒超时
  })
} 