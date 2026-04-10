import { useNavigate } from 'react-router-dom'
import DashboardTopBar from '@/components/layout/DashboardTopBar'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import LoadingSpinner from '@/components/common/LoadingSpinner'
export default function DashboardHome() {
  const navigate = useNavigate()
  const { data: courses, loading } = useFetch(api.getCourses)

  if (loading) return <LoadingSpinner />

  // Splitting mock courses just to show both Enrolled and Teaching
  const enrolledCourses = courses?.slice(0, 4) || []
  const teachingCourses = courses?.slice(4, 5) || []

  const CardImage1 = () => (
    <svg viewBox="0 0 100 100" className="absolute right-0 bottom-0 w-32 h-32 opacity-90 transition-transform group-hover:scale-105">
      <path d="M70,80 Q90,80 90,50 Q90,30 70,30 Q60,30 50,40 Q40,30 30,30 Q10,30 10,50 Q10,80 30,80 Z" fill="#E8F0FE" />
      <circle cx="50" cy="40" r="15" fill="#1967D2" />
      <path d="M40,65 Q50,75 50,65 Q50,55 60,65" stroke="#1967D2" strokeWidth="4" fill="none" />
    </svg>
  );

  const DefaultImage = ({ color }: { color: string }) => (
    <svg viewBox="0 0 100 100" className="absolute right-0 bottom-0 w-28 h-28 opacity-90 transition-transform group-hover:scale-105" fill="none">
      <circle cx="70" cy="50" r="30" fill={color} fillOpacity="0.1" />
      <rect x="55" y="40" width="30" height="20" rx="4" fill={color} fillOpacity="0.2" />
      <circle cx="70" cy="30" r="10" fill={color} fillOpacity="0.3" />
    </svg>
  )

  return (
    <div className="min-h-full bg-[#FAF9F6] font-[Inter]">
      <DashboardTopBar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Enrolled</h1>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-class-modal'))} 
            className="px-4 py-2 bg-[#1976D2] hover:bg-[#1565C0] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            New Class +
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {enrolledCourses.map((course, i) => (
            <div 
              key={course.id} 
              onClick={() => navigate('/course/student')}
              className="group relative bg-white border border-[#E5E7EB] rounded-xl p-5 h-44 cursor-pointer hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-[#111827]">Course</h2>
                <p className="text-base font-semibold" style={{ color: course.color === '#E0E0E0' ? '#9CA3AF' : course.color }}>
                  {course.name}
                </p>
              </div>

              <div className="relative z-10 flex flex-col gap-1">
                {i === 0 && (
                  <div className="absolute top-0 right-0 -mt-10 mr-1 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center top-badge shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-gray-500" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                )}
                {i === 2 && (
                  <div className="absolute top-0 right-0 -mt-10 mr-1 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center top-badge shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-orange-500" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-auto">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-400" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {(i === 0 || i === 2) && (
                    <span className="text-[11px] text-gray-500 font-medium underline decoration-gray-300 underline-offset-2">
                      {i === 0 ? 'Due Tue' : 'Due Today'}
                    </span>
                  )}
                </div>
              </div>

              {/* Pseudo-illustrations based on index to give the visual variety from figma */}
              <DefaultImage color={course.color === '#E0E0E0' ? '#9CA3AF' : course.color} />
            </div>
          ))}
        </div>

        <div className="mb-6 mt-10">
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Teaching</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachingCourses.map((course) => (
            <div 
              key={course.id} 
              onClick={() => navigate('/course/teacher')}
              className="group relative bg-white border border-[#E5E7EB] rounded-xl p-5 h-44 cursor-pointer hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-[#111827]">Course</h2>
                <p className="text-base font-semibold" style={{ color: course.color === '#E0E0E0' ? '#9CA3AF' : course.color }}>
                  {course.name}
                </p>
              </div>

              <div className="relative z-10 mt-auto">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-400" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>

              <DefaultImage color={course.color === '#E0E0E0' ? '#9CA3AF' : course.color} />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
