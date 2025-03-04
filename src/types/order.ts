// 订单状态类型
export type OrderStatus = 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled'

// 支付渠道类型
export type PaymentChannel = '支付宝' | '企业微信' | '慧辞' | '匠易艺' | ''

// 订单查询参数类型
export interface OrderQuery {
  page: number
  pageSize: number
  order_id?: string
  payment_id?: string
  channel?: string
  startTime?: string
  endTime?: string
}

// 订单信息类型
export interface Order {
  id: number
  order_id: string
  payment_id: string
  channel: string
  amount: number
  refund_amount: number
  fee: number
  merchant_payment: number
  status: string
  created_at: string
  updated_at: string
}

// 修改处理订单响应类型
export interface ProcessOrderResponse {
  code: 0 | 1  // 限定为 0 或 1
  message: string
  data: {
    processed_file: string
  } | null
} 