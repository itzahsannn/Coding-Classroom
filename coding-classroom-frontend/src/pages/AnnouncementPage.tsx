import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import DashboardTopBar from '@/components/layout/DashboardTopBar'

const INITIAL_COMMENTS = [
  { id: 1, author: 'Ali Hassan', initials: 'AH', color: '#10B981', time: '1 hr ago', text: 'Will the exam cover CSS Grid or just Flexbox?' },
  { id: 2, author: 'Sara Ahmed', initials: 'SA', color: '#EC4899', time: '45 min ago', text: 'Do we need to bring a calculator?' },
  { id: 3, author: 'Prof. John Carter', initials: 'JC', color: '#1967D2', time: '30 min ago', text: 'Both Grid and Flexbox are included. No calculators needed — it\'s a written exam.' },
]

const AnnouncementPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [localComments, setLocalComments] = useState(INITIAL_COMMENTS)

  const { data: course, loading: courseLoading } = useFetch(api.getCourseDetails)
  const { data: ann, loading: annLoading } = useFetch(() => api.getAnnouncementById(id || ''))

  const handleAddComment = async () => {
    if (!commentText.trim() || !ann) return
    setPosting(true)
    await api.addCommentToAnnouncement(ann.id, commentText)
    
    setLocalComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: 'Me',
        initials: 'Me',
        color: '#1967D2',
        time: 'Just now',
        text: commentText,
      }
    ])
    
    setCommentText('')
    setPosting(false)
  }

  if (courseLoading || annLoading || !course || !ann) return <LoadingSpinner />

  return (
    <div className="min-h-full bg-[#F8F9FA] flex flex-col">
      <DashboardTopBar 
        breadcrumbs={
          <>
            <button onClick={() => navigate('/course/student')} className="hover:text-[#1967D2] transition-colors">{course.name}</button>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-[#202124] font-medium">Stream</span>
          </>
        }
      />

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
        <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm overflow-hidden">
          <div className="h-1" style={{ backgroundColor: ann.authorColor }} />
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm shrink-0"
                style={{ backgroundColor: ann.authorColor }}
              >
                {ann.authorInitial}
              </div>
              <div>
                <p className="font-medium text-[#202124] text-sm">{ann.authorName}</p>
                <p className="text-xs text-[#5F6368]">{ann.postedTime}</p>
              </div>
            </div>
            <p className="text-sm text-[#3C4043] leading-relaxed whitespace-pre-line">{ann.body}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F1F3F4] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#5F6368]">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <h3 className="text-sm font-medium text-[#202124]">{localComments.length} Class comments</h3>
          </div>

          <div className="divide-y divide-[#F1F3F4]">
            {localComments.map((c) => (
              <div key={c.id} className="flex gap-3 px-4 py-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0 mt-0.5"
                  style={{ backgroundColor: c.color }}
                >
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[#202124]">{c.author}</span>
                    <span className="text-xs text-[#5F6368]">{c.time}</span>
                  </div>
                  <p className="text-sm text-[#3C4043] mt-0.5 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-[#F1F3F4] flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#1967D2] flex items-center justify-center text-white text-xs font-medium shrink-0">Me</div>
            <div className="flex-1 flex items-center gap-2 border border-[#DADCE0] rounded-full px-3 py-2 focus-within:border-[#1967D2] focus-within:ring-1 focus-within:ring-[#1967D2] transition-all bg-white">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add class comment..."
                disabled={posting}
                className="flex-1 text-sm bg-transparent outline-none text-[#202124] placeholder-[#9AA0A6]"
              />
              {(commentText || posting) && (
                <button 
                  onClick={handleAddComment}
                  disabled={posting}
                  className="text-[#1967D2] hover:text-[#1557B0] transition-colors shrink-0 disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementPage
