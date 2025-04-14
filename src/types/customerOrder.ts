export interface CustomerOrder {
  id?: number
  order_id: string
  date: string
  is_fixed: number
  order_content?: string
  word_count?: number
  fee?: number
  customer_id?: number
  writer_id?: number
  exchange_time?: string
  payment_channel?: string
  store_name?: string
  new_customer?: number
  taobao_order_id?: string
  taobao_order_id2?: string
  wechat_pay_id?: string
  wechat_pay_id2?: string
  order_amount?: number
  refund_amount?: number
  special_situation?: string
}

export interface CustomerOrderResponse {
  id: number
  order_id: string
}

export interface CustomerOrderItem extends CustomerOrder {
  customer_service_name: string
  writer_name: string
  created_at: string
  updated_at: string
}

export interface CustomerOrderQuery {
  page?: number
  pageSize?: number
  order_id?: string
  date_start?: string
  date_end?: string
  customer_id?: number
  writer_id?: number
  is_fixed?: number
} 