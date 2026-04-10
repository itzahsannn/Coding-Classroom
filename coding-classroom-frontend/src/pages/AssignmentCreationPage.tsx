import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const TOPICS = ['No topic', 'Week 1 – HTML Basics', 'Week 2 – CSS', 'Week 3 – JavaScript', 'Week 4 – React']

const AssignmentCreationPage = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [points, setPoints] = useState('100')
  const [dueDate, setDueDate] = useState('')
  const [topic, setTopic] = useState(TOPICS[0])
  const [attachments, setAttachments] = useState<{ label: string; icon: string }[]>([])
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [saving, setSaving] = useState(false)

  const { data: course, loading } = useFetch(api.getCourseDetails)

  const canAssign = title.trim().length > 0 && !saving

  const handleAssign = async () => {
    if (!canAssign) return
    setSaving(true)
    await api.createAssignment({ title, instructions, points, due: dueDate })
    setSaving(false)
    navigate('/course/teacher')
  }

  if (loading || !course) return <LoadingSpinner />

  return (
    <div className="min-h-full bg-[#F8F9FA]">
      <div className="bg-white border-b border-[#E0E0E0] flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/course/teacher')}
            className="p-1.5 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#1967D2] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <path d="M19 3H4.99C3.89 3 3 3.9 3 5l.01 14c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-[#5F6368]">{course.name}</p>
            <p className="text-sm font-medium text-[#202124]">Assignment</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 text-sm text-[#5F6368] border border-[#DADCE0] rounded-full hover:bg-[#F1F3F4] transition-colors font-medium disabled:opacity-50"
            onClick={() => navigate('/course/teacher')}
            disabled={saving}
          >
            Save draft
          </button>
          <button
            onClick={handleAssign}
            disabled={!canAssign}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
              canAssign
                ? 'bg-[#1967D2] text-white hover:bg-[#1557B0]'
                : 'bg-[#E8EAED] text-[#9AA0A6] cursor-not-allowed'
            }`}
          >
            {saving ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm p-6 space-y-5">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                disabled={saving}
                className="w-full text-base text-[#202124] placeholder-[#9AA0A6] outline-none border-b-2 border-[#E0E0E0] pb-2 focus:border-[#1967D2] transition-colors bg-transparent font-medium disabled:opacity-50"
              />
            </div>
            <div>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Instructions (optional)"
                rows={10}
                disabled={saving}
                className="w-full text-sm text-[#3C4043] placeholder-[#9AA0A6] outline-none resize-none border border-[#E0E0E0] rounded-lg p-3 focus:border-[#1967D2] focus:ring-1 focus:ring-[#1967D2] transition-all bg-transparent disabled:opacity-50"
              />
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 border border-[#DADCE0] rounded-lg bg-[#F8F9FA]">
                    <span className="text-lg shrink-0">{att.icon}</span>
                    <span className="flex-1 text-sm text-[#1967D2] font-medium truncate">{att.label}</span>
                    <button
                      onClick={() => setAttachments((p) => p.filter((_, idx) => idx !== i))}
                      disabled={saving}
                      className="text-[#5F6368] hover:text-[#D93025] transition-colors shrink-0 disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#5F6368] border border-[#DADCE0] rounded-full hover:bg-[#F1F3F4] transition-colors font-medium disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                </svg>
                Add
              </button>

              {showAttachMenu && (
                <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-[#E0E0E0] rounded-lg shadow-lg z-10 overflow-hidden">
                  {[
                    { label: 'Google Drive', icon: '📁' },
                    { label: 'Link', icon: '🔗' },
                    { label: 'File', icon: '📄' },
                    { label: 'YouTube', icon: '▶️' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setAttachments((p) => [...p, { label: item.label, icon: item.icon }])
                        setShowAttachMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#3C4043] hover:bg-[#F1F3F4] transition-colors text-left"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm divide-y divide-[#F1F3F4]">
            <div className="px-4 py-3">
              <label className="block text-xs text-[#5F6368] mb-1.5">For</label>
              <div className="flex items-center gap-2 p-2 border border-[#DADCE0] rounded-lg bg-[#F8F9FA]">
                <span className="w-4 h-4 rounded-full bg-[#1967D2] shrink-0" />
                <span className="text-sm text-[#202124] font-medium truncate">{course.name}</span>
              </div>
            </div>

            <div className="px-4 py-3">
              <label className="block text-xs text-[#5F6368] mb-1.5">Points</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 text-sm border border-[#DADCE0] rounded-lg outline-none focus:border-[#1967D2] focus:ring-1 focus:ring-[#1967D2] transition-all bg-white text-[#202124] disabled:opacity-50"
                min="0"
                max="100"
              />
            </div>

            <div className="px-4 py-3">
              <label className="block text-xs text-[#5F6368] mb-1.5">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 text-sm border border-[#DADCE0] rounded-lg outline-none focus:border-[#1967D2] focus:ring-1 focus:ring-[#1967D2] transition-all bg-white text-[#202124] disabled:opacity-50"
              />
            </div>

            <div className="px-4 py-3">
              <label className="block text-xs text-[#5F6368] mb-1.5">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 text-sm border border-[#DADCE0] rounded-lg outline-none focus:border-[#1967D2] focus:ring-1 focus:ring-[#1967D2] transition-all bg-white text-[#202124] disabled:opacity-50"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentCreationPage
