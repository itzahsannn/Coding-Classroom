import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ClassroomRoutes } from './ClassroomRoutes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/course/student" replace />} />
        <Route path="/*" element={<ClassroomRoutes />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
