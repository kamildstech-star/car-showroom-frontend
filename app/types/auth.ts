export interface AdminUser {
  id: number
  name: string
  email: string
  created_at?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  data?: AdminUser
  errors?: Record<string, string[]>
}
