import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardHome from '@/pages/DashboardHome'
import CalendarPage from '@/pages/CalendarPage'
import CodingPlaygroundPage from '@/pages/CodingPlaygroundPage'
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
        {/* Redirect base /course to dashboard instead of forcing a specific course */}
        <Route path="/course" element={<Navigate to="/dashboard" replace />} />
        
        {/* New Screens */}
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/coding-playground" element={<CodingPlaygroundPage />} />

        {/* Existing specific course screens */}
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
