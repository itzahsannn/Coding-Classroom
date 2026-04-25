import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface AttachedFile {
  name: string
  size: number
  file: File
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const AssignmentCreationPage = () => {
  const { classroomId } = useParams<{ classroomId: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [points, setPoints] = useState('100')
  const [dueDate, setDueDate] = useState('')
  const [topic, setTopic] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [showCustomTopic, setShowCustomTopic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [attachments, setAttachments] = useState<AttachedFile[]>([])

  const { data: course, loading } = useFetch(
    () => api.getCourseDetails(classroomId!), [classroomId]
  )

  // Fetch existing topics from this classroom's assignments
  const { data: existingTopics } = useFetch(
    () => api.getTopics(classroomId!), [classroomId]
  )

  const topics = existingTopics || []
  const canAssign = title.trim().length > 0 && !saving

  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList) return
    const newFiles = Array.from(fileList).map(f => ({ name: f.name, size: f.size, file: f }))
    setAttachments(prev => [...prev, ...newFiles])
  }

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleAssign = async () => {
    if (!canAssign || !classroomId) return
    setSaving(true)
    try {
      for (const att of attachments) {
        await api.uploadAttachment(classroomId, att.file)
      }
      const finalTopic = showCustomTopic ? customTopic : topic
      await api.createAssignment({
        classroom_id: classroomId,
        title,
        instructions,
        points,
        due: dueDate,
        topic: finalTopic || undefined,
      })
      navigate(`/course/${classroomId}`)
    } catch (err) {
      console.error('Failed to create assignment:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !course) return <LoadingSpinner />

  return (
    <div className="min-h-full bg-[#F8F9FA]">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E0E0E0] flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/course/${classroomId}`)} className="p-1.5 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#1967D2] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M19 3H4.99C3.89 3 3 3.9 3 5l.01 14c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
          </div>
          <div>
            <p className="text-xs text-[#5F6368]">{course.name}</p>
            <p className="text-sm font-medium text-[#202124]">Assignment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/course/${classroomId}`)} disabled={saving}
            className="px-4 py-2 text-sm text-[#5F6368] border border-[#DADCE0] rounded-full hover:bg-[#F1F3F4] font-medium disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleAssign} disabled={!canAssign}
            className={`px-5 py-2 text-sm font-medium rounded-full ${canAssign ? 'bg-[#1967D2] text-white hover:bg-[#1557B0]' : 'bg-[#E8EAED] text-[#9AA0A6] cursor-not-allowed'}`}>
            {saving ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row gap-6">
        {/* Left — form */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm p-6 space-y-5">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" disabled={saving}
              className="w-full text-base text-[#202124] placeholder-[#9AA0A6] outline-none border-b-2 border-[#E0E0E0] pb-2 focus:border-[#1967D2] bg-transparent font-medium disabled:opacity-50"/>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions (optional)" rows={8} disabled={saving}
              className="w-full text-sm text-[#3C4043] placeholder-[#9AA0A6] outline-none resize-none border border-[#E0E0E0] rounded-lg p-3 focus:border-[#1967D2] bg-transparent disabled:opacity-50"/>

            {/* Attachments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-[#5F6368]">Attachments</h4>
                <button onClick={() => fileInputRef.current?.click()} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#1967D2] border border-[#DADCE0] rounded-full hover:bg-[#E8F0FE] font-medium disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  Add file
                </button>
                <input ref={fileInputRef} type="file" multiple className="hidden"
                  accept=".py,.js,.ts,.pdf,.docx,.doc,.zip,.txt,.html,.css,.json,.md,.png,.jpg"
                  onChange={(e) => handleAddFiles(e.target.files)}/>
              </div>

              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 border border-[#DADCE0] rounded-lg bg-[#F8F9FA] group">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1967D2" className="w-5 h-5 shrink-0">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#202124] font-medium truncate">{att.name}</p>
                        <p className="text-[10px] text-[#9AA0A6]">{formatSize(att.size)}</p>
                      </div>
                      <button onClick={() => handleRemoveFile(i)} className="text-[#5F6368] hover:text-[#D93025] opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#DADCE0] rounded-lg p-6 text-center cursor-pointer hover:border-[#1967D2] hover:bg-[#F8F9FA] transition-colors"
                  onClick={() => fileInputRef.current?.click()}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9AA0A6" className="w-6 h-6 mx-auto mb-1.5">
                    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                  </svg>
                  <p className="text-xs text-[#9AA0A6]">Click to attach reference files</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — settings */}
        <div className="w-full md:w-64 shrink-0">
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
              <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} disabled={saving} min="0" max="100"
                className="w-full px-3 py-2 text-sm border border-[#DADCE0] rounded-lg outline-none focus:border-[#1967D2] bg-white text-[#202124] disabled:opacity-50"/>
            </div>
            <div className="px-4 py-3">
              <label className="block text-xs text-[#5F6368] mb-1.5">Due date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={saving}
                className="w-full px-3 py-2 text-sm border border-[#DADCE0] rounded-lg outline-none focus:border-[#1967D2] bg-white text-[#202124] disabled:opacity-50"/>
            </div>
            <div className="px-4 py-3">
              <label className="block text-xs text-[#5F6368] mb-1.5">Topic</label>
              {showCustomTopic ? (
                <div className="flex gap-1.5">
                  <input type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Enter topic name" autoFocus disabled={saving}
                    className="flex-1 px-3 py-2 text-sm border border-[#DADCE0] rounded-lg outline-none focus:border-[#1967D2] bg-white text-[#202124] disabled:opacity-50"/>
                  <button onClick={() => { setShowCustomTopic(false); setCustomTopic('') }}
                    className="text-xs text-[#5F6368] hover:text-[#D93025] px-1">✕</button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <select value={topic} onChange={(e) => setTopic(e.target.value)} disabled={saving}
                    className="w-full px-3 py-2 text-sm border border-[#DADCE0] rounded-lg outline-none focus:border-[#1967D2] bg-white text-[#202124] disabled:opacity-50">
                    <option value="">No topic</option>
                    {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={() => setShowCustomTopic(true)}
                    className="flex items-center gap-1 text-xs text-[#1967D2] hover:text-[#1557B0] font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    Create topic
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentCreationPage
