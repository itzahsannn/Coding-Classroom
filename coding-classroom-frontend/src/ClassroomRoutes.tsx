import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CoursePage from '@/pages/CoursePage'
import TeacherCoursePage from '@/pages/TeacherCoursePage'
import AnnouncementPage from '@/pages/AnnouncementPage'
import TeacherAnnouncementPage from '@/pages/TeacherAnnouncementPage'
import AssignmentPage from '@/pages/AssignmentPage'
import AssignmentCreationPage from '@/pages/AssignmentCreationPage'

export const ClassroomRoutes = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/course" element={<Navigate to="/course/student" replace />} />

        <Route path="/course/student" element={<CoursePage />} />
        <Route path="/course/student/announcement/:id" element={<AnnouncementPage />} />
        <Route path="/course/student/assignment/:id" element={<AssignmentPage />} />

        <Route path="/course/teacher" element={<TeacherCoursePage />} />
        <Route path="/course/teacher/announcement/:id" element={<TeacherAnnouncementPage />} />
        <Route path="/course/teacher/assignment/new" element={<AssignmentCreationPage />} />
      </Route>
    </Routes>
  )
}
