import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { ClassroomWithColor } from '@/types'

const DashboardLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  
  const isHomeActive = location.pathname === '/dashboard' || location.pathname === '/'
  const isCalendarActive = location.pathname === '/calendar'
  const isPlaygroundActive = location.pathname === '/coding-playground'

  const { data: courses, loading } = useFetch(api.getCourses)

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false)
      else setIsSidebarOpen(true)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleToggle = () => setIsSidebarOpen(prev => !prev)
    window.addEventListener('toggle-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-sidebar', handleToggle)
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111827' }}>
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col shrink-0 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
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
            to="/dashboard"
            className="flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
            style={{ 
              backgroundColor: isHomeActive ? '#4285F4' : '#F8F9FA',
              color: isHomeActive ? 'white' : '#4B5563',
              border: isHomeActive ? '1px solid #3B82F6' : '1px solid #D1D5DB',
              boxShadow: isHomeActive ? '0 4px 6px -1px rgba(66, 133, 244, 0.4)' : ''
            }}
          >
            Home
          </Link>
          
          <Link
            to="/calendar"
            className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
            style={{ 
              backgroundColor: isCalendarActive ? '#4285F4' : '#F8F9FA',
              color: isCalendarActive ? 'white' : '#4B5563',
              border: isCalendarActive ? '1px solid #3B82F6' : '1px solid #D1D5DB',
              boxShadow: isCalendarActive ? '0 4px 6px -1px rgba(66, 133, 244, 0.4)' : ''
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${isCalendarActive ? 'text-white' : 'text-gray-700'}`}>
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
            </svg>
            Calendar
          </Link>
          
          <Link
            to="/coding-playground"
            className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
            style={{ 
              backgroundColor: isPlaygroundActive ? '#4285F4' : '#F8F9FA',
              color: isPlaygroundActive ? 'white' : '#4B5563',
              border: isPlaygroundActive ? '1px solid #3B82F6' : '1px solid #D1D5DB',
              boxShadow: isPlaygroundActive ? '0 4px 6px -1px rgba(66, 133, 244, 0.4)' : ''
            }}
          >
            <span className={`font-bold font-mono text-sm ${isPlaygroundActive ? 'text-white' : 'text-gray-700'}`}>{`{}`}</span>
            Coding Playground
          </Link>

          {/* Enrolled shortcut — navigates to dashboard (enrolled section) */}
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
            style={{
              backgroundColor: '#F8F9FA',
              color: '#4B5563',
              border: '1px solid #D1D5DB',
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-700">
              <path d="M12 3L1 9l4 2.18V17h2v-4.82L12 14l7-3.82V17h2V11.18L23 9 12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z"/>
            </svg>
            Enrolled
          </Link>
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
            courses?.map((course: ClassroomWithColor) => (
              <button
                key={course.id}
                onClick={() => navigate(`/course/${course.id}`)}
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

        <div className="p-4 border-t space-y-2" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-[#1967D2] flex items-center justify-center text-white text-xs font-medium shrink-0">
              {user?.user_metadata?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <span className="text-sm font-medium text-[#3C4043] truncate">{user?.user_metadata?.name || user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium text-gray-500 hover:bg-black/5 transition-all"
            style={{ border: '1px solid #D1D5DB' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Sign out
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
