import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardHome from '@/pages/DashboardHome'
import CalendarPage from '@/pages/CalendarPage'
import CodingPlaygroundPage from '@/pages/CodingPlaygroundPage'
import CoursePage from '@/pages/CoursePage'
import AnnouncementPage from '@/pages/AnnouncementPage'
import AssignmentPage from '@/pages/AssignmentPage'
import AssignmentCreationPage from '@/pages/AssignmentCreationPage'
import TeacherSubmissionsPage from '@/pages/TeacherSubmissionsPage'
import ProtectedRoute from '@/components/common/ProtectedRoute'

export const ClassroomRoutes = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Redirect base /course to dashboard */}
        <Route path="/course" element={<Navigate to="/dashboard" replace />} />

        {/* Main screens */}
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/coding-playground" element={<CodingPlaygroundPage />} />

        {/* Dynamic classroom routes */}
        <Route path="/course/:classroomId" element={<CoursePage />} />
        <Route path="/course/:classroomId/announcement/:id" element={<AnnouncementPage />} />
        <Route path="/course/:classroomId/assignment/:id" element={<AssignmentPage />} />
        <Route
          path="/course/:classroomId/assignment/new"
          element={
            <ProtectedRoute requiredRole="instructor">
              <AssignmentCreationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:classroomId/assignment/:id/submissions"
          element={
            <ProtectedRoute requiredRole="instructor">
              <TeacherSubmissionsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}
