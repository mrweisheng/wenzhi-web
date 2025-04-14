// 写手信息类型
export interface Writer {
  id: number
  writer_id: string 
  name: string
  education: string
  major: string
  writing_experience: string
  specialized_content?: string
  phone_1?: string
  phone_2?: string
  alipay_name?: string
  alipay_account?: string
  id_number?: string
  ip_address?: string
  starred: boolean
  processed: boolean
  created_time: string
  created_by: string
  last_modified_time: string
  last_modified_by: string
  is_activated?: number
  latest_rating?: {
    id: number
    score: number
    comment: string
    date: string
    created_at: string
    updated_at: string
    quality_inspector?: {
      id: number
      name: string
    }
  }
}

// 写手表单类型
export interface WriterForm {
  id?: number
  writer_id?: string
  name: string
  education: string
  major: string
  writing_experience: string
  specialized_content?: string
  phone_1?: string
  phone_2?: string
  alipay_name?: string
  alipay_account?: string
  id_number?: string
  ip_address?: string
  apply_date?: string
}

// 查询参数类型
export interface WriterQuery {
  page?: number
  pageSize?: number
  writer_id?: string
  name?: string
  education?: string
  writing_experience?: string
  startTime?: string
  endTime?: string
}

// 写手列表项类型
export interface WriterListItem {
  id: number
  name: string
  writer_id?: string
  phone_1?: string
}

// 写手列表响应类型
export interface WriterListResponse {
  code: number
  message: string
  data: WriterListItem[]
} 