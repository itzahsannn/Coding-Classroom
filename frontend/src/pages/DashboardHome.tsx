import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import DashboardTopBar from '@/components/layout/DashboardTopBar'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { ClassroomWithColor } from '@/types'

export default function DashboardHome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: courses, loading, refetch } = useFetch(api.getCourses)

  const [showModal, setShowModal] = useState(false)
  const [modalTab, setModalTab] = useState<'create' | 'join'>('join')
  const [className, setClassName] = useState('')
  const [classSection, setClassSection] = useState('')
  const [classCode, setClassCode] = useState('')
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  if (loading) return <LoadingSpinner />

  const enrolledCourses = courses?.filter((c: ClassroomWithColor) => c.instructor_id !== user?.id) || []
  const teachingCourses = courses?.filter((c: ClassroomWithColor) => c.instructor_id === user?.id) || []

  const DefaultImage = ({ color }: { color: string }) => (
    <svg viewBox="0 0 100 100" className="absolute right-0 bottom-0 w-28 h-28 opacity-90 transition-transform group-hover:scale-105" fill="none">
      <circle cx="70" cy="50" r="30" fill={color} fillOpacity="0.1" />
      <rect x="55" y="40" width="30" height="20" rx="4" fill={color} fillOpacity="0.2" />
      <circle cx="70" cy="30" r="10" fill={color} fillOpacity="0.3" />
    </svg>
  )

  const handleCreate = async () => {
    if (!className.trim()) return
    setModalLoading(true)
    setModalError('')
    try {
      await api.createClassroom(className, classSection)
      setShowModal(false)
      setClassName('')
      setClassSection('')
      refetch()
    } catch (err: any) {
      setModalError(err.message || 'Failed to create class')
    } finally {
      setModalLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!classCode.trim()) return
    setModalLoading(true)
    setModalError('')
    try {
      await api.joinClassroom(classCode)
      setShowModal(false)
      setClassCode('')
      refetch()
    } catch (err: any) {
      setModalError(err.message || 'Failed to join class')
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-[#FAF9F6] font-[Inter]">
      <DashboardTopBar />

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Enrolled</h1>
          <button 
            onClick={() => setShowModal(true)} 
            className="px-4 py-2 bg-[#1976D2] hover:bg-[#1565C0] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            New Class +
          </button>
        </div>

        {enrolledCourses.length === 0 && (
          <div className="bg-white border border-dashed border-[#D1D5DB] rounded-xl p-8 text-center mb-12">
            <p className="text-[#6B7280] text-sm">No enrolled courses yet. Join a class using a class code!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {enrolledCourses.map((course: ClassroomWithColor) => (
            <div 
              key={course.id} 
              onClick={() => navigate(`/course/${course.id}`)}
              className="group relative bg-white border border-[#E5E7EB] rounded-xl p-5 h-44 cursor-pointer hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-[#111827]">{course.name}</h2>
                <p className="text-base font-semibold" style={{ color: course.color }}>
                  {course.section || 'No section'}
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-2 mt-auto">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-400" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <DefaultImage color={course.color} />
            </div>
          ))}
        </div>

        <div className="mb-6 mt-10">
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Teaching</h1>
        </div>

        {teachingCourses.length === 0 && (
          <div className="bg-white border border-dashed border-[#D1D5DB] rounded-xl p-8 text-center">
            <p className="text-[#6B7280] text-sm">Not teaching any courses yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachingCourses.map((course: ClassroomWithColor) => (
            <div 
              key={course.id} 
              onClick={() => navigate(`/course/${course.id}`)}
              className="group relative bg-white border border-[#E5E7EB] rounded-xl p-5 h-44 cursor-pointer hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-[#111827]">{course.name}</h2>
                <p className="text-base font-semibold" style={{ color: course.color }}>
                  {course.section || 'No section'}
                </p>
              </div>
              <div className="relative z-10 mt-auto">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-400" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <DefaultImage color={course.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Create / Join Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex border-b border-[#E5E7EB]">
              <button
                onClick={() => { setModalTab('join'); setModalError('') }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  modalTab === 'join' ? 'text-[#1976D2] border-b-2 border-[#1976D2]' : 'text-[#6B7280]'
                }`}
              >
                Join Class
              </button>
              <button
                onClick={() => { setModalTab('create'); setModalError('') }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  modalTab === 'create' ? 'text-[#1976D2] border-b-2 border-[#1976D2]' : 'text-[#6B7280]'
                }`}
              >
                Create Class
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{modalError}</p>
                </div>
              )}

              {modalTab === 'join' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#5F6368] mb-1.5">Class Code</label>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      placeholder="Enter class code..."
                      className="w-full px-4 py-2.5 bg-white border border-[#DADCE0] rounded-md text-sm outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2] transition-all"
                      disabled={modalLoading}
                    />
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={modalLoading || !classCode.trim()}
                    className="w-full py-2.5 bg-[#1976D2] hover:bg-[#1565C0] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-70"
                  >
                    {modalLoading ? 'Joining...' : 'Join'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#5F6368] mb-1.5">Class Name</label>
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="e.g., Web Programming"
                      className="w-full px-4 py-2.5 bg-white border border-[#DADCE0] rounded-md text-sm outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2] transition-all"
                      disabled={modalLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5F6368] mb-1.5">Section (optional)</label>
                    <input
                      type="text"
                      value={classSection}
                      onChange={(e) => setClassSection(e.target.value)}
                      placeholder="e.g., BCS-6B"
                      className="w-full px-4 py-2.5 bg-white border border-[#DADCE0] rounded-md text-sm outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2] transition-all"
                      disabled={modalLoading}
                    />
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={modalLoading || !className.trim()}
                    className="w-full py-2.5 bg-[#1976D2] hover:bg-[#1565C0] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-70"
                  >
                    {modalLoading ? 'Creating...' : 'Create'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
