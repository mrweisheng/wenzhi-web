export interface Role {
  id: number
  role_name: string
  description?: string
  created_at?: string
  updated_at?: string
  menu_ids?: number[]
}

export interface RoleForm {
  role_name: string
  description?: string
  menu_ids?: number[]
} 