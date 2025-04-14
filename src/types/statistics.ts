export interface DailyAmount {
  date: string
  amount: number
}

export interface Statistics {
  userCount: number
  menuCount: number
  roleCount: number
  writerCount: number
  orderCount: number
  sevenDaysAmount: DailyAmount[]
  channelOrders: Record<string, number>
} 