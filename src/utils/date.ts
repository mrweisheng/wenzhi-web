import type { DateModelType } from 'element-plus'

// 处理日期范围
export const formatDateRange = (range: [DateModelType, DateModelType] | undefined | null) => {
  if (!range || !range[0] || !range[1]) {
    return { startTime: '', endTime: '' }
  }
  return {
    startTime: String(range[0]),
    endTime: String(range[1])
  }
}

// 处理单个日期
export const formatDate = (date: DateModelType | undefined | null) => {
  return date ? String(date) : ''
}

// 重置日期范围
export const resetDateRange = () => {
  return undefined as [DateModelType, DateModelType] | undefined
} 