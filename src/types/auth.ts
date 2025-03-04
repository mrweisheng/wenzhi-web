export interface LoginForm {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  expires: number
  userInfo: any
} 