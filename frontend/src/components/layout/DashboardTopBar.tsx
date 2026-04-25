import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

interface DashboardTopBarProps {
  breadcrumbs?: React.ReactNode
  onSearch?: (query: string) => void
}

export default function DashboardTopBar({ breadcrumbs, onSearch }: DashboardTopBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const userName = user?.user_metadata?.name || user?.email || 'User'
  const userEmail = user?.email || ''
  const userInitial = userName.charAt(0).toUpperCase()

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Emit search to parent or via custom event for DashboardHome
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (onSearch) {
      onSearch(query)
    } else {
      // Broadcast to DashboardHome via custom event
      window.dispatchEvent(new CustomEvent('classroom-search', { detail: { query } }))
    }
  }, [onSearch])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="bg-[#FAF9F6] lg:bg-transparent h-14 flex items-center justify-between px-4 lg:px-6 shrink-0 pt-2 lg:pt-4 relative z-40">
      <div className="flex items-center gap-2 text-sm text-[#5F6368] font-medium">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
          className="lg:hidden p-1.5 mr-1 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {breadcrumbs}
      </div>

      <div className="flex items-center gap-5">
        {/* ─── Search Bar ─── */}
        <div className="relative hidden sm:flex">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-400" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-64 bg-[#F1F3F4] text-sm text-[#5F6368] rounded-md outline-none focus:ring-2 focus:ring-[#1967D2]/20 transition-all placeholder:text-[#5F6368]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                window.dispatchEvent(new CustomEvent('classroom-search', { detail: { query: '' } }))
                if (onSearch) onSearch('')
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-[#5F6368]">
          {/* Notifications */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => toggleDropdown('bell')} className="hover:text-gray-900 transition-colors focus:outline-none">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            {openDropdown === 'bell' && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                <div className="px-4 py-2 border-b border-gray-100 font-semibold text-gray-800 text-sm">Notifications</div>
                <div className="px-4 py-6 text-center text-gray-500 text-sm">You have no new notifications.</div>
              </div>
            )}
          </div>
          
          {/* New class */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => toggleDropdown('plus')} className="hover:text-gray-900 transition-colors focus:outline-none">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            {openDropdown === 'plus' && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                 <button 
                   onClick={() => { setOpenDropdown(null); navigate('/dashboard') }} 
                   className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                 >
                   Join class
                 </button>
                 <button 
                   onClick={() => { setOpenDropdown(null); navigate('/dashboard') }} 
                   className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                 >
                   Create class
                 </button>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => toggleDropdown('profile')} className="hover:text-gray-900 transition-colors focus:outline-none flex items-center justify-center w-7 h-7 bg-[#1967D2] rounded-full text-white text-xs font-bold shadow-sm">
                {userInitial}
             </button>
             {openDropdown === 'profile' && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                 <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                 </div>
                 <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 transition-colors font-medium">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
