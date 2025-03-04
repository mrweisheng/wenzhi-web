export interface Menu {
  id: number
  name: string
  path: string
  icon: string
  sort: number
  parent_id: number | null
  children?: Menu[]
}

export interface MenuForm {
  id?: number
  name: string
  path: string
  icon: string
  sort: number
  parent_id: number | null
} 