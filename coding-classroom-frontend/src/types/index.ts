export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: 'student' | 'instructor' | 'admin'
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  studentsCount: number
  rating: number
  thumbnailUrl?: string
  tags: string[]
  price: number | 'free'
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  duration: number
  videoUrl?: string
  order: number
  isCompleted?: boolean
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
