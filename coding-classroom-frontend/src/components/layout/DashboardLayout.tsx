import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const DashboardLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const isTeacher = location.pathname.includes('/teacher')
  const [tab, setTab] = useState<'enrolled' | 'hidden'>('enrolled')
  
  const basePath = isTeacher ? '/course/teacher' : '/course/student'
  const { data: courses, loading } = useFetch(api.getCourses)

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111827' }}>
      
      <aside
        className="flex flex-col shrink-0 overflow-y-auto"
        style={{
          width: '260px',
          background: '#F5F5F3', 
          borderRight: '1px solid #E5E7EB',
        }}
      >
        <div className="flex justify-end gap-1.5 px-4 pt-4">
          <div className="w-1.5 h-1.5 rounded-full border border-gray-500"></div>
          <div className="w-1.5 h-1.5 rounded-full border border-gray-400"></div>
          <div className="w-1.5 h-1.5 rounded-full border border-gray-600"></div>
        </div>

        <div className="flex items-center justify-center gap-3 px-4 pt-4 pb-8">
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="M8 2v5l2-1.5L12 7V2" strokeWidth="2" fill="#2D3748" />
            </svg>
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">Coding Classroom</span>
        </div>

        <div className="px-5 space-y-2.5 mb-2">
          
          <Link
            to={basePath}
            className="flex items-center justify-center w-full py-2.5 rounded-lg text-sm text-gray-600 font-medium hover:bg-white transition-all shadow-sm"
            style={{ border: '1px solid #D1D5DB', backgroundColor: '#F8F9FA' }}
          >
            Home
          </Link>
          
          <Link
            to="#"
            className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-lg text-sm text-gray-600 font-medium hover:bg-white transition-all shadow-sm"
            style={{ border: '1px solid #D1D5DB', backgroundColor: '#F8F9FA' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-700">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
            </svg>
            Calendar
          </Link>
          
          <Link
            to="#"
            className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-lg text-sm text-gray-600 font-medium hover:bg-white transition-all shadow-sm"
            style={{ border: '1px solid #D1D5DB', backgroundColor: '#F8F9FA' }}
          >
            <span className="font-bold font-mono text-gray-700 text-sm">{`{}`}</span>
            Coding Playground
          </Link>
          
          <button
            onClick={() => setTab('enrolled')}
            className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-lg text-sm font-medium transition-all shadow-md relative"
            style={{
              backgroundColor: tab === 'enrolled' ? '#4285F4' : '#F8F9FA',
              color: tab === 'enrolled' ? 'white' : '#4B5563',
              border: tab === 'enrolled' ? '1px solid #3B82F6' : '1px solid #D1D5DB',
              boxShadow: tab === 'enrolled' ? '0 4px 6px -1px rgba(66, 133, 244, 0.4)' : '',
              zIndex: tab === 'enrolled' ? 10 : 1,
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 3L1 9l4 2.18V17h2v-4.82L12 14l7-3.82V17h2V11.18L23 9 12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z"/>
            </svg>
            Enrolled
          </button>
          
          <button
            onClick={() => setTab('hidden')}
            className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-lg text-sm transition-all shadow-sm font-medium"
            style={{
              backgroundColor: tab === 'hidden' ? '#4285F4' : '#F8F9FA',
              color: tab === 'hidden' ? 'white' : '#8C929D',
              border: tab === 'hidden' ? '1px solid #3B82F6' : '1px solid #D1D5DB',
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
            </svg>
            Hidden Courses
          </button>
        </div>

        <div className="flex items-center mx-[20px] my-6">
          <div className="flex-1 h-px bg-[#E5E7EB]"></div>
          <span className="px-3 text-[11px] text-[#A0A0A0] font-medium tracking-wide">Courses</span>
          <div className="flex-1 h-px bg-[#E5E7EB]"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-6">
          {loading ? (
            <div className="py-4"><LoadingSpinner /></div>
          ) : (
            courses?.map((course, i) => (
              <button
                key={course.id + i}
                onClick={() => navigate(basePath)}
                className="w-full flex items-center gap-4 py-2 rounded-lg hover:bg-black/5 transition-all text-left group"
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: course.color }}
                />
                <span className="truncate text-[14px] font-semibold text-[#3C4043]">
                  {course.name}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t" style={{ borderColor: '#E5E7EB' }}>
          <button
            onClick={() => navigate(isTeacher ? '/course/student' : '/course/teacher')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium text-gray-500 hover:bg-black/5 transition-all"
            style={{ border: '1px solid #D1D5DB' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            {isTeacher ? 'Student view' : 'Teacher view'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-white">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
