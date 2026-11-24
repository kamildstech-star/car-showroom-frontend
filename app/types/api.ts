export interface ApiResponse<T = unknown> {
  success?: boolean
  status?: string
  message?: string
  data?: T
  [key: string]: unknown
}

export interface HealthStatus {
  status: string
  service: string
  version: string
  environment: string
  timestamp: string
  database: string
}
