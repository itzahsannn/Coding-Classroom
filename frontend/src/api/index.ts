import { supabase } from '@/lib/supabaseClient'
import type {
  Classroom,
  Assignment,
  Announcement,
  AnnouncementWithMeta,
  Comment,
  Submission,
  UserProfile,
} from '@/types'

// ─── Color palette for classroom cards ─────────────────────────────

const CARD_COLORS = [
  '#FF7D7D', '#C0EE9E', '#AECBFA', '#F7BCFF',
  '#EEDE69', '#A0D9D9', '#FFB570', '#C4B5FD',
]

const AVATAR_COLORS = [
  '#E67C73', '#F2A600', '#129EAF', '#1967D2',
  '#E8710A', '#D50000', '#8E24AA', '#3F51B5',
]

function pickColor(id: string, palette: string[]): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// ─── Auth helpers ──────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

// ─── Classrooms ────────────────────────────────────────────────────

async function getCourses() {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as Classroom[]).map(c => ({
    ...c,
    color: pickColor(c.id, CARD_COLORS),
  }))
}

async function getCourseDetails(classroomId: string) {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', classroomId)
    .single()

  if (error) throw error
  return data as Classroom
}

async function createClassroom(name: string, section: string) {
  const userId = await getCurrentUserId()
  const classCode = Math.random().toString(36).substring(2, 10)

  const { data, error } = await supabase
    .from('classrooms')
    .insert({
      name,
      section: section || null,
      instructor_id: userId,
      class_code: classCode,
    })
    .select()
    .single()

  if (error) throw error
  return data as Classroom
}

async function joinClassroom(classCode: string) {
  const { data: classroomId, error } = await supabase.rpc('join_classroom', {
    p_class_code: classCode.trim()
  })

  if (error) {
    if (error.message.includes('Invalid class code')) throw new Error('Invalid class code')
    if (error.code === '23505') throw new Error('Already enrolled in this class')
    throw error
  }

  // Fetch the classroom details now that we are enrolled
  const { data: classroom, error: fetchError } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', classroomId)
    .single()

  if (fetchError) throw fetchError
  return classroom
}

// ─── Assignments ───────────────────────────────────────────────────

async function getUpcoming(classroomId: string) {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('status', 'published')
    .gte('deadline', now)
    .order('deadline', { ascending: true })
    .limit(5)

  if (error) throw error
  return (data as Assignment[]).map(a => ({
    id: a.id,
    title: a.title,
    due: a.deadline ? 'Due Soon' : '',
    dueDate: a.deadline
      ? new Date(a.deadline).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      : 'No due date',
  }))
}

async function getAllAssignments(classroomId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Assignment[]
}

async function getAssignmentById(id: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  const assignment = data as Assignment
  return {
    id: assignment.id,
    title: assignment.title,
    points: assignment.points,
    due: assignment.deadline
      ? new Date(assignment.deadline).toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })
      : 'No due date',
    dueShort: assignment.deadline ? 'Due Soon' : '',
    postedBy: 'Instructor',
    postedTime: formatTimeAgo(assignment.created_at),
    instructions: assignment.description || '',
    attachments: [],
    classroom_id: assignment.classroom_id,
    status: assignment.status,
  }
}

async function createAssignment(data: {
  classroom_id: string
  title: string
  instructions: string
  points: string
  due: string
  topic?: string
}) {
  const { data: result, error } = await supabase
    .from('assignments')
    .insert({
      classroom_id: data.classroom_id,
      title: data.title,
      description: data.instructions || null,
      deadline: data.due || null,
      points: Number(data.points) || 100,
      topic: data.topic && data.topic !== 'No topic' ? data.topic : null,
      status: 'published',
    })
    .select()
    .single()

  if (error) throw error
  return result as Assignment
}

async function getTopics(classroomId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('assignments')
    .select('topic')
    .eq('classroom_id', classroomId)
    .not('topic', 'is', null)

  if (error) throw error
  const unique = [...new Set((data || []).map((d: { topic: string }) => d.topic).filter(Boolean))]
  return unique as string[]
}

// ─── Announcements ────────────────────────────────────────────────

async function getAnnouncements(classroomId: string): Promise<AnnouncementWithMeta[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const announcements = data as Announcement[]

  // Fetch comment counts in parallel
  const withMeta: AnnouncementWithMeta[] = await Promise.all(
    announcements.map(async (ann) => {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('announcement_id', ann.id)

      return {
        ...ann,
        author_name: 'Instructor', // Simplified — will be enriched with user lookup later
        author_initial: 'I',
        author_color: pickColor(ann.author_id, AVATAR_COLORS),
        comment_count: count || 0,
      }
    })
  )

  return withMeta
}

async function getAnnouncementById(id: string) {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Announcement
}

async function createAnnouncement(classroomId: string, body: string) {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('announcements')
    .insert({
      classroom_id: classroomId,
      author_id: userId,
      body,
    })
    .select()
    .single()

  if (error) throw error
  return data as Announcement
}

// ─── Comments ──────────────────────────────────────────────────────

async function getComments(announcementId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('announcement_id', announcementId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as Comment[]).map(c => ({
    ...c,
    author_name: 'User',
    author_initial: '?',
    author_color: pickColor(c.author_id, AVATAR_COLORS),
  }))
}

async function addCommentToAnnouncement(announcementId: string, text: string) {
  const userId = await getCurrentUserId()

  const { error } = await supabase
    .from('comments')
    .insert({
      announcement_id: announcementId,
      author_id: userId,
      body: text,
    })

  if (error) throw error
  return { success: true }
}

// ─── Submissions ───────────────────────────────────────────────────

async function submitCode(assignmentId: string, filename: string, code: string) {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('submissions')
    .upsert(
      {
        assignment_id: assignmentId,
        student_id: userId,
        filename,
        code,
      },
      { onConflict: 'assignment_id,student_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data as Submission
}

async function submitAssignmentFiles(assignmentId: string) {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('submissions')
    .upsert(
      {
        assignment_id: assignmentId,
        student_id: userId,
        filename: 'Attached Files',
        code: '/* Student uploaded files via the Assignment panel. Check the submissions folder. */',
      },
      { onConflict: 'assignment_id,student_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data as Submission
}

async function getSubmission(assignmentId: string) {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('student_id', userId)
    .maybeSingle()

  if (error) throw error
  return data as Submission | null
}

async function getSubmissionsForAssignment(assignmentId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, grades(*)')
    .eq('assignment_id', assignmentId)

  if (error) throw error
  return data
}

// ─── People ────────────────────────────────────────────────────────

async function getPeople(classroomId: string) {
  // Get classroom to find instructor
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('instructor_id')
    .eq('id', classroomId)
    .single()

  // Get enrollments
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('classroom_id', classroomId)

  if (error) throw error

  const teacherProfile: UserProfile = {
    id: classroom?.instructor_id || '',
    email: '',
    name: 'Instructor',
    role: 'instructor',
    initial: 'I',
    color: '#1967D2',
  }

  const studentProfiles: UserProfile[] = (enrollments || []).map((e, i) => ({
    id: e.student_id,
    email: '',
    name: `Student ${i + 1}`,
    role: 'student' as const,
    initial: `S${i + 1}`,
    color: pickColor(e.student_id, AVATAR_COLORS),
  }))

  return {
    teachers: [teacherProfile],
    students: studentProfiles,
  }
}

// ─── Grades ────────────────────────────────────────────────────────

async function getGrades(classroomId: string) {
  const { data: assignments, error: aErr } = await supabase
    .from('assignments')
    .select('id, title, points')
    .eq('classroom_id', classroomId)

  if (aErr) throw aErr

  const { data: enrollments, error: eErr } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('classroom_id', classroomId)

  if (eErr) throw eErr

  const { data: submissions, error: sErr } = await supabase
    .from('submissions')
    .select('*, grades(*)')
    .in('assignment_id', (assignments || []).map(a => a.id))

  if (sErr) throw sErr

  // Build grade map per student
  const studentMap = new Map<string, { name: string; initial: string; color: string; grades: Record<string, number | null> }>()

  // Initialize all enrolled students
  ;(enrollments || []).forEach((e, i) => {
    studentMap.set(e.student_id, {
      name: `Student`,
      initial: `S`,
      color: pickColor(e.student_id, AVATAR_COLORS),
      grades: {},
    })
  })

  for (const sub of (submissions || [])) {
    if (!studentMap.has(sub.student_id)) continue // Just in case
    const student = studentMap.get(sub.student_id)!
    const grade = Array.isArray(sub.grades) && sub.grades.length > 0 ? sub.grades[0] : null
    // If there is a submission, but no grade, it's null. If no submission at all, it remains undefined.
    student.grades[sub.assignment_id] = grade?.score ?? null
  }

  return {
    assignments: (assignments || []).map(a => ({ id: a.id, title: a.title, outOf: a.points })),
    students: Array.from(studentMap.entries()).map(([id, s]) => ({
      id,
      ...s,
    })),
  }
}

async function gradeSubmission(submissionId: string, score: number) {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('grades')
    .upsert({
      submission_id: submissionId,
      score: Number(score),
      graded_by: userId
    }, { onConflict: 'submission_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Calendar (all assignments across enrolled classrooms) ─────────

async function getCalendarAssignments() {
  const { data, error } = await supabase
    .from('assignments')
    .select('*, classrooms(name)')
    .eq('status', 'published')
    .not('deadline', 'is', null)
    .order('deadline', { ascending: true })

  if (error) throw error
  return (data || []).map((a: any) => ({
    ...a,
    classroom_name: a.classrooms?.name || 'Unknown',
  }))
}

// ─── File Uploads (Supabase Storage) ───────────────────────────────

async function uploadSubmissionFile(
  assignmentId: string,
  file: File
): Promise<{ path: string; url: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const ext = file.name.split('.').pop() || 'bin'
  const path = `${user.id}/${assignmentId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('submissions')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('submissions')
    .getPublicUrl(path)

  return { path, url: urlData.publicUrl }
}

async function uploadAttachment(
  classroomId: string,
  file: File
): Promise<{ path: string; name: string; size: number }> {
  const path = `${classroomId}/${Date.now()}_${file.name}`

  const { error } = await supabase.storage
    .from('attachments')
    .upload(path, file, { upsert: true })

  if (error) throw error

  return { path, name: file.name, size: file.size }
}

async function getAttachmentUrl(path: string): Promise<string> {
  const { data } = await supabase.storage
    .from('attachments')
    .createSignedUrl(path, 3600) // 1-hour signed URL

  return data?.signedUrl || ''
}

async function getSubmissionFileUrl(path: string): Promise<string> {
  const { data } = await supabase.storage
    .from('submissions')
    .createSignedUrl(path, 3600)

  return data?.signedUrl || ''
}

async function deleteSubmissionFile(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('submissions')
    .remove([path])

  if (error) throw error
}

async function deleteAttachment(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('attachments')
    .remove([path])

  if (error) throw error
}

async function listSubmissionFiles(assignmentId: string): Promise<{ name: string; path: string; size: number }[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.storage
    .from('submissions')
    .list(`${user.id}/${assignmentId}`)

  if (error) throw error
  return (data || []).map((f) => ({
    name: f.name,
    path: `${user.id}/${assignmentId}/${f.name}`,
    size: f.metadata?.size || 0,
  }))
}

async function listStudentSubmissionFiles(assignmentId: string, studentId: string): Promise<{ name: string; path: string; size: number }[]> {
  const { data, error } = await supabase.storage
    .from('submissions')
    .list(`${studentId}/${assignmentId}`)

  if (error) throw error
  return (data || []).map((f) => ({
    name: f.name,
    path: `${studentId}/${assignmentId}/${f.name}`,
    size: f.metadata?.size || 0,
  }))
}

// ─── Export ────────────────────────────────────────────────────────

export const api = {
  // Classrooms
  getCourses,
  getCourseDetails,
  createClassroom,
  joinClassroom,

  // Assignments
  getUpcoming,
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  getTopics,

  // Announcements
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,

  // Comments
  getComments,
  addCommentToAnnouncement,

  // Submissions
  submitCode,
  submitAssignmentFiles,
  getSubmission,
  getSubmissionsForAssignment,

  // People & Grades
  getPeople,
  getGrades,
  gradeSubmission,

  // Calendar
  getCalendarAssignments,

  // File Uploads
  uploadSubmissionFile,
  uploadAttachment,
  getAttachmentUrl,
  getSubmissionFileUrl,
  deleteSubmissionFile,
  deleteAttachment,
  listSubmissionFiles,
  listStudentSubmissionFiles,
}
