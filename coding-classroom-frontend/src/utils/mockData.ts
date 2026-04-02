export const MOCK_COURSE = {
  name: 'Course Code Course',
  section: 'Section',
  instructor: 'Instructor',
  semester: 'Semester Season',
  classCode: 'mz4yzp3n',
}

export const MOCK_UPCOMING = [
  { id: 'asgn1', title: 'Assignment 1: Topic', due: 'Due Soon', dueDate: 'Due 11:59 PM' },
]

export const MOCK_ANNOUNCEMENTS = [
  {
    id: 'ann1',
    type: 'assignment' as const,
    authorName: 'Rushda Muneer',
    authorInitial: 'M',
    authorColor: '#1967D2',
    postedTime: 'Yesterday • Edited 2:40 PM',
    body: 'Rushda Muneer posted a new assignment: Assignment 1',
    hasAssignment: true,
    assignmentId: 'asgn1',
    points: 100,
    comments: 0,
    likes: 0,
  },
  {
    id: 'ann2',
    type: 'post' as const,
    authorName: 'Ahmad Abdul Rahman',
    authorInitial: 'A',
    authorColor: '#E67E22',
    postedTime: 'Yesterday',
    body: 'You can get your quizzes today. I\'ll be in the cafe from 12:30 to 2:00 PM. Please ensure you have your student ID ready when collecting them.',
    hasAssignment: false,
    assignmentId: undefined,
    points: undefined,
    comments: 2,
    likes: 9,
  },
]

export const MOCK_ASSIGNMENT = {
  id: 'asgn1',
  title: 'Assignment 1: Topic',
  points: 100,
  due: 'Friday, March 28, 2026',
  dueShort: 'Due Soon',
  postedBy: 'Rushda Muneer',
  postedTime: 'Yesterday',
  instructions: `Please complete the assignment as outlined in the brief. Make sure to review all the requirements before starting.

Requirements:
  1. Follow the project structure provided in class
  2. Ensure all sections are complete and clearly labeled
  3. Submit via the platform before the deadline

This assignment accounts for 100 points toward your final grade. Late submissions may receive reduced marks.`,
  attachments: [] as { name: string; icon: string }[],
}
