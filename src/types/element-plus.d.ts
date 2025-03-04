import type { DateModelType } from 'element-plus'

declare module 'element-plus' {
  export interface DatePickerProps {
    modelValue: DateModelType | [DateModelType, DateModelType] | null
  }
} 