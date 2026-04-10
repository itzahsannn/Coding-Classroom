import { MOCK_COURSE, MOCK_ANNOUNCEMENTS, MOCK_UPCOMING, MOCK_ASSIGNMENT } from '@/utils/mockData'

const MOCK_COURSES = [
  { id: 'c1', name: 'Course Code Course', color: '#FF7D7D' }, // Pastel Red
  { id: 'c2', name: 'Course Code Course', color: '#C0EE9E' }, // Pastel Green
  { id: 'c3', name: 'Course Code Course', color: '#D9D9D9' }, // Light Gray
  { id: 'c4', name: 'Course Code Course', color: '#AECBFA' }, // Light Blue
  { id: 'c5', name: 'Course Code Course', color: '#F7BCFF' }, // Pink
  { id: 'c6', name: 'Course Code Course', color: '#EEDE69' }, // Yellow
  { id: 'c7', name: 'Course Code Course', color: '#E0E0E0' }, // Light Gray
  { id: 'c8', name: 'Course Code Course', color: '#E0E0E0' }, // Light Gray
]
let db = {
  courses: [...MOCK_COURSES],
  courseDetails: { ...MOCK_COURSE },
  upcoming: [...MOCK_UPCOMING],
  announcements: [...MOCK_ANNOUNCEMENTS],
  assignments: [MOCK_ASSIGNMENT],
}

const delay = (ms: number = 600) => new Promise((resolve) => setTimeout(resolve, ms))

export const api = {
  getCourses: async () => {
    await delay()
    return db.courses
  },

  getCourseDetails: async () => {
    await delay()
    return db.courseDetails
  },

  getUpcoming: async () => {
    await delay()
    return db.upcoming
  },

  getAnnouncements: async () => {
    await delay()
    return [...db.announcements].reverse()
  },

  getAnnouncementById: async (id: string) => {
    await delay()
    const ann = db.announcements.find((a) => a.id === id)
    if (!ann) throw new Error('Announcement not found')
    return ann
  },

  createAnnouncement: async (body: string) => {
    await delay(800)
    const newAnn = {
      id: `ann${Date.now()}`,
      type: 'post' as const,
      authorName: 'Rushda Muneer',
      authorInitial: 'M',
      authorColor: '#1967D2',
      postedTime: 'Just now',
      body,
      hasAssignment: false,
      assignmentId: undefined,
      points: undefined,
      comments: 0,
      likes: 0,
    }
    db.announcements.unshift(newAnn)
    return newAnn
  },

  addCommentToAnnouncement: async (announcementId: string, text: string) => {
    await delay(500)
    console.log('Adding comment:', text)
    const ann = db.announcements.find((a) => a.id === announcementId)
    if (ann) {
      ann.comments += 1
    }
    return { success: true }
  },

  getAssignmentById: async (id: string) => {
    await delay()
    const asn = db.assignments.find((a) => a.id === id)
    return asn || db.assignments[0]
  },

  createAssignment: async (data: { title: string; instructions: string; points: string; due: string }) => {
    await delay(1000)
    const newId = `asgn${Date.now()}`
    const newAsn = {
      id: newId,
      title: data.title,
      points: Number(data.points) || 100,
      due: data.due || 'No due date',
      dueShort: 'Due Soon',
      postedBy: 'Rushda Muneer',
      postedTime: 'Just now',
      instructions: data.instructions,
      attachments: [],
    }
    db.assignments.push(newAsn)

    const newAnn = {
      id: `ann_${newId}`,
      type: 'assignment' as const,
      authorName: 'Rushda Muneer',
      authorInitial: 'M',
      authorColor: '#1967D2',
      postedTime: 'Just now',
      body: `Rushda Muneer posted a new assignment: ${data.title}`,
      hasAssignment: true,
      assignmentId: newId,
      points: newAsn.points,
      comments: 0,
      likes: 0,
    }
    db.announcements.push(newAnn)

    db.upcoming.push({
      id: newId,
      title: data.title,
      due: 'Due Soon',
      dueDate: data.due || 'Upcoming',
    })

    return newAsn
  },

  getAllAssignments: async () => {
    await delay()
    return db.assignments
  },

  getPeople: async () => {
    await delay()
    return {
      teachers: [
        { id: 't1', name: 'Teacher 1 {Teacher}', initial: 'T1', color: '#E8EAED' },
        { id: 't2', name: 'Teacher 2 {Teaching Assistant}', initial: 'T2', color: '#F3E8FD' },
        { id: 't3', name: 'Teacher 3', initial: 'T3', color: '#F3E8FD' },
        { id: 't4', name: 'Teacher 4', initial: 'T4', color: '#E8EAED' },
      ],
      students: [
        { id: 's1', name: 'Student 1', initial: 'S1', color: '#E8EAED' },
        { id: 's2', name: 'Student 2', initial: 'S2', color: '#F3E8FD' },
        { id: 's3', name: 'Student 3', initial: 'S3', color: '#F3E8FD' },
        { id: 's4', name: 'Student 4', initial: 'S4', color: '#E8EAED' },
        { id: 's5', name: 'Student 5', initial: 'S5', color: '#F3E8FD' },
        { id: 's6', name: 'Student 6', initial: 'S6', color: '#E8EAED' },
        { id: 's7', name: 'Student 7', initial: 'S7', color: '#F3E8FD' },
      ]
    }
  },

  getGrades: async () => {
    await delay()
    return {
      assignments: db.assignments.map(a => ({ id: a.id, title: a.title, outOf: a.points })),
      students: [
        { id: 's1', name: 'Ahmad Abdul Rahman', initial: 'A', color: '#E67C73', grades: { 'asgn1': 100 } },
        { id: 's2', name: 'Zaid Khan', initial: 'Z', color: '#F2A600', grades: { 'asgn1': 85 } },
        { id: 's3', name: 'Sara Smith', initial: 'S', color: '#129EAF', grades: { 'asgn1': null } },
      ]
    }
  }
}
