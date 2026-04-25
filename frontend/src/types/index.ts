// ─── Database Row Types (match Supabase schema) ────────────────────

export interface Classroom {
  id: string
  name: string
  section: string | null
  instructor_id: string
  class_code: string
  created_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  classroom_id: string
  enrolled_at: string
}

export interface Assignment {
  id: string
  classroom_id: string
  title: string
  description: string | null
  deadline: string | null
  points: number
  status: 'draft' | 'published' | 'closed'
  created_at: string
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  filename: string
  code: string
  llm_feedback: string | null
  submitted_at: string
}

export interface Grade {
  id: string
  submission_id: string
  score: number
  comment: string | null
  graded_by: string
  graded_at: string
}

export interface Announcement {
  id: string
  classroom_id: string
  author_id: string
  body: string
  created_at: string
}

export interface Comment {
  id: string
  announcement_id: string
  author_id: string
  body: string
  created_at: string
}

// ─── Derived / UI Types ────────────────────────────────────────────

export interface ClassroomWithColor extends Classroom {
  color: string // Generated client-side for dashboard cards
}

export interface AnnouncementWithMeta extends Announcement {
  author_name: string
  author_initial: string
  author_color: string
  comment_count: number
}

export interface AssignmentWithClassroom extends Assignment {
  classroom_name?: string
}

export interface SubmissionWithGrade extends Submission {
  grade?: Grade | null
  assignment?: Assignment | null
}

// ─── User Metadata ────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'student' | 'instructor'
  initial: string
  color: string
}

// ─── API Helpers ───────────────────────────────────────────────────

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
