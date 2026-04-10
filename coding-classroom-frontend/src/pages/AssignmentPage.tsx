import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import DashboardTopBar from '@/components/layout/DashboardTopBar'

const AssignmentPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [privateComment, setPrivateComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [file, setFile] = useState<string | null>(null)

  const { data: course, loading: courseLoading } = useFetch(api.getCourseDetails)
  const { data: asgn, loading: asgnLoading } = useFetch(() => api.getAssignmentById(id || ''))

  if (courseLoading || asgnLoading || !course || !asgn) return <LoadingSpinner />

  return (
    <div className="min-h-full bg-[#F8F9FA] flex flex-col">
      <DashboardTopBar 
        breadcrumbs={
          <>
            <button onClick={() => navigate('/course/student')} className="hover:text-[#1967D2] transition-colors">{course.name}</button>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-[#202124] font-medium">Classwork</span>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-[#202124] font-medium">{asgn.title}</span>
          </>
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm overflow-hidden">
            <div className="h-1 bg-[#1967D2]" />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1967D2] flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                      <path d="M19 3H4.99C3.89 3 3 3.9 3 5l.01 14c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-[#202124]">{asgn.title}</h2>
                    <p className="text-xs text-[#5F6368]">{asgn.postedBy} · {asgn.postedTime}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-medium text-[#202124]">{asgn.points} points</p>
                  <p className="text-xs text-[#D93025] font-medium">Due {asgn.due.split(',')[0]}</p>
                </div>
              </div>

              <div className="border-t border-[#E0E0E0] my-4" />

              <p className="text-sm text-[#3C4043] leading-relaxed whitespace-pre-line">{asgn.instructions}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#F1F3F4]">
              <h3 className="text-sm font-medium text-[#202124]">Private comments</h3>
              <p className="text-xs text-[#5F6368]">Only visible to you and your instructor</p>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#E8EAED] flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5F6368" className="w-4 h-4">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="flex-1 flex items-center gap-2 border border-[#DADCE0] rounded-full px-3 py-2 focus-within:border-[#1967D2] focus-within:ring-1 focus-within:ring-[#1967D2] transition-all">
                <input
                  type="text"
                  value={privateComment}
                  onChange={(e) => setPrivateComment(e.target.value)}
                  placeholder="Add private comment..."
                  className="flex-1 text-sm bg-transparent outline-none text-[#202124] placeholder-[#9AA0A6]"
                />
                {privateComment && (
                  <button className="text-[#1967D2]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-64 shrink-0 space-y-3">
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#202124]">Your work</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                submitted ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#FEF3E2] text-[#B45309]'
              }`}>
                {submitted ? 'Turned in' : 'Assigned'}
              </span>
            </div>

            {file ? (
              <div className="mb-3 flex items-center gap-2.5 p-2.5 border border-[#DADCE0] rounded-lg bg-[#F8F9FA]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1967D2" className="w-5 h-5 shrink-0">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                <span className="flex-1 text-xs text-[#202124] font-medium truncate">{file}</span>
                <button onClick={() => setFile(null)} className="text-[#5F6368] hover:text-[#D93025] transition-colors shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            ) : (
              !submitted && (
                <div className="flex flex-col gap-2 mb-4">
                  <button
                    onClick={() => navigate(`/coding-playground?assignmentId=${id}`)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-[#1967D2] rounded-lg hover:bg-[#1557B0] transition-colors font-medium shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    Open in Coding Screen
                  </button>
                  <button
                    onClick={() => setFile('my_assignment.pdf')}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-[#1967D2] border border-[#DADCE0] rounded-lg hover:bg-[#E8F0FE] transition-colors font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Add or create
                  </button>
                </div>
              )
            )}

            {!submitted ? (
              <button
                onClick={() => setSubmitted(true)}
                disabled={!file}
                className={`w-full py-2.5 rounded-full text-sm font-medium transition-colors ${
                  file
                    ? 'bg-[#1967D2] text-white hover:bg-[#1557B0]'
                    : 'bg-[#E8EAED] text-[#9AA0A6] cursor-not-allowed'
                }`}
              >
                Hand in
              </button>
            ) : (
              <button
                onClick={() => setSubmitted(false)}
                className="w-full py-2.5 rounded-full text-sm font-medium border border-[#DADCE0] text-[#5F6368] hover:bg-[#F1F3F4] transition-colors"
              >
                Unsubmit
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#5F6368]">Due date</span>
              <span className="text-xs font-medium text-[#202124]">{asgn.due}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#5F6368]">Points</span>
              <span className="text-sm font-semibold text-[#202124]">{asgn.points}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentPage
