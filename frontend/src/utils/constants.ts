export const APP_NAME = 'Code Classroom'
export const APP_DESCRIPTION = 'Learn to code with interactive lessons and real projects.'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const

export const COURSE_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'DevOps',
  'Design',
  'Cybersecurity',
] as const

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 12,
} as const
