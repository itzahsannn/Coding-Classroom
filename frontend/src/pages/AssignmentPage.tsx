import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import DashboardTopBar from '@/components/layout/DashboardTopBar'

interface UploadedFile {
  name: string
  path: string
  size: number
}

interface InstructorAttachment {
  name: string
  path: string
  size: number
  url: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Code file extensions that can be opened in playground
const CODE_EXTENSIONS = ['.py', '.js', '.ts']

function isCodeFile(name: string): boolean {
  return CODE_EXTENSIONS.some(ext => name.toLowerCase().endsWith(ext))
}

const AssignmentPage = () => {
  const { classroomId, id } = useParams<{ classroomId: string; id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [privateComment, setPrivateComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [instructorAttachments, setInstructorAttachments] = useState<InstructorAttachment[]>([])

  const { data: course, loading: courseLoading } = useFetch(
    () => api.getCourseDetails(classroomId!), [classroomId]
  )
  const { data: asgn, loading: asgnLoading } = useFetch(
    () => api.getAssignmentById(id || ''), [id]
  )

  const isTeacher = course?.instructor_id === user?.id

  // Load instructor attachments (visible to everyone)
  useEffect(() => {
    if (!id) return
    api.getAssignmentAttachments(id).then(setInstructorAttachments).catch(() => {})
  }, [id])

  // Load existing submission files (students only)
  // Guard with courseLoading: isTeacher is false while course=null, causing race condition
  useEffect(() => {
    if (!id || courseLoading || isTeacher) return
    api.listSubmissionFiles(id).then(setFiles).catch(() => {})
    api.getSubmission(id).then(sub => {
      if (sub) setSubmitted(true)
    }).catch(() => {})
  }, [id, isTeacher, courseLoading])

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || !id) return
    setUploading(true)
    try {
      const newFiles: UploadedFile[] = []
      for (const file of Array.from(fileList)) {
        const result = await api.uploadSubmissionFile(id, file)
        newFiles.push({ name: file.name, path: result.path, size: file.size })
      }
      setFiles(prev => [...prev, ...newFiles])
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = async (path: string) => {
    try {
      await api.deleteSubmissionFile(path)
      setFiles(prev => prev.filter(f => f.path !== path))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleDownload = async (file: UploadedFile | InstructorAttachment) => {
    try {
      if ('url' in file && file.url) {
        window.open(file.url, '_blank')
      } else {
        const url = await api.getSubmissionFileUrl((file as UploadedFile).path)
        window.open(url, '_blank')
      }
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  // Open a specific student file in the coding playground
  const handleOpenFileInPlayground = (file: UploadedFile) => {
    const params = new URLSearchParams({
      assignmentId: id || '',
      classroomId: classroomId || '',
      filePath: file.path,
    })
    navigate(`/coding-playground?${params.toString()}`)
  }

  // Generic "Open in Coding Screen" — prefers the first uploaded code file
  const handleOpenInPlayground = () => {
    const codeFile = files.find(f => isCodeFile(f.name))
    if (codeFile) {
      handleOpenFileInPlayground(codeFile)
    } else {
      navigate(`/coding-playground?assignmentId=${id}&classroomId=${classroomId}`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  const handleSubmit = async () => {
    if (!id) return
    try {
      await api.submitAssignmentFiles(id)
      setSubmitted(true)
    } catch (err) {
      console.error('Submit failed', err)
    }
  }

  const handleUnsubmit = async () => {
    if (!id) return
    try {
      await api.unsubmitAssignment(id)
      setSubmitted(false)
    } catch (err) {
      console.error('Unsubmit failed', err)
    }
  }

  if (courseLoading || asgnLoading || !course || !asgn) return <LoadingSpinner />

  return (
    <div className="min-h-full bg-[#F8F9FA] flex flex-col">
      <DashboardTopBar breadcrumbs={
        <>
          <button onClick={() => navigate(`/course/${classroomId}`)} className="hover:text-[#1967D2] transition-colors">{course.name}</button>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-[#202124] font-medium">{asgn.title}</span>
        </>
      }/>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-6">
        {/* Left column — assignment details */}
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
                  <p className="text-xs text-[#D93025] font-medium">Due {typeof asgn.due === 'string' ? asgn.due.split(',')[0] : ''}</p>
                </div>
              </div>
              <div className="border-t border-[#E0E0E0] my-4" />
              <p className="text-sm text-[#3C4043] leading-relaxed whitespace-pre-line">{asgn.instructions}</p>

              {/* ─── Instructor Attachments (visible to all) ─── */}
              {instructorAttachments.length > 0 && (
                <div className="mt-5 pt-4 border-t border-[#E0E0E0]">
                  <h4 className="text-xs font-semibold text-[#5F6368] uppercase tracking-wide mb-3">Reference Files</h4>
                  <div className="space-y-2">
                    {instructorAttachments.map((att) => (
                      <button
                        key={att.path}
                        onClick={() => handleDownload(att)}
                        className="w-full flex items-center gap-3 p-2.5 border border-[#DADCE0] rounded-lg bg-[#F8F9FA] hover:border-[#1967D2] hover:shadow-sm transition-all group text-left"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1967D2" className="w-5 h-5 shrink-0">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#202124] truncate group-hover:text-[#1967D2]">{att.name}</p>
                          {att.size > 0 && <p className="text-[10px] text-[#9AA0A6]">{formatSize(att.size)}</p>}
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9AA0A6" className="w-4 h-4 shrink-0">
                          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Private comments */}
          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#F1F3F4]">
              <h3 className="text-sm font-medium text-[#202124]">Private comments</h3>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#E8EAED] flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5F6368" className="w-4 h-4">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="flex-1 flex items-center gap-2 border border-[#DADCE0] rounded-full px-3 py-2 focus-within:border-[#1967D2]">
                <input type="text" value={privateComment} onChange={(e) => setPrivateComment(e.target.value)}
                  placeholder="Add private comment..." className="flex-1 text-sm bg-transparent outline-none text-[#202124] placeholder-[#9AA0A6]"/>
                {privateComment && (
                  <button className="text-[#1967D2]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-full md:w-72 shrink-0 space-y-3">
          {/* ─── STUDENT VIEW: Your work panel ─── */}
          {!isTeacher && (
            <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#202124]">Your work</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${submitted ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#FEF3E2] text-[#B45309]'}`}>
                  {submitted ? 'Turned in' : 'Assigned'}
                </span>
              </div>

              {/* Uploaded files list */}
              {files.length > 0 && (
                <div className="space-y-2 mb-3">
                  {files.map((f) => (
                    <div key={f.path} className="flex items-center gap-2.5 p-2.5 border border-[#DADCE0] rounded-lg bg-[#F8F9FA] group">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1967D2" className="w-5 h-5 shrink-0">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        {/* Code files: open in playground; others: download */}
                        {isCodeFile(f.name) ? (
                          <button
                            onClick={() => handleOpenInPlayground(f)}
                            className="text-xs text-[#1967D2] font-medium truncate block hover:underline w-full text-left"
                            title="Open in Coding Playground"
                          >
                            {f.name}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDownload(f)}
                            className="text-xs text-[#1967D2] font-medium truncate block hover:underline w-full text-left"
                          >
                            {f.name}
                          </button>
                        )}
                        {f.size > 0 && <p className="text-[10px] text-[#9AA0A6]">{formatSize(f.size)}</p>}
                      </div>
                      {!submitted && (
                        <button onClick={() => handleRemoveFile(f.path)} className="text-[#5F6368] hover:text-[#D93025] opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload area */}
              {!submitted && (
                <div className="space-y-2 mb-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                      dragOver ? 'border-[#1967D2] bg-[#E8F0FE]' : 'border-[#DADCE0] hover:border-[#1967D2] hover:bg-[#F8F9FA]'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={dragOver ? '#1967D2' : '#9AA0A6'} className="w-8 h-8 mx-auto mb-2">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                    </svg>
                    {uploading ? (
                      <p className="text-xs text-[#1967D2] font-medium">Uploading...</p>
                    ) : (
                      <>
                        <p className="text-xs text-[#5F6368] font-medium">Drag files here or click to upload</p>
                        <p className="text-[10px] text-[#9AA0A6] mt-1">.py, .js, .pdf, .zip — max 10MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".py,.js,.ts,.pdf,.zip,.txt,.html,.css,.json,.md"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                  />

                  {/* Open in Playground (generic — loads existing or sandbox) */}
                  <button
                    onClick={() => navigate(`/coding-playground?assignmentId=${id}&classroomId=${classroomId}`)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-[#1967D2] rounded-lg hover:bg-[#1557B0] font-medium shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                    Open in Coding Screen
                  </button>
                </div>
              )}

              {/* Submit / Unsubmit */}
              {!submitted ? (
                <button onClick={handleSubmit} disabled={files.length === 0}
                  className={`w-full py-2.5 rounded-full text-sm font-medium transition-colors ${
                    files.length > 0
                      ? 'bg-[#1967D2] text-white hover:bg-[#1557B0]'
                      : 'bg-[#E8EAED] text-[#9AA0A6] cursor-not-allowed'
                  }`}>
                  Hand in
                </button>
              ) : (
                <button onClick={handleUnsubmit}
                  className="w-full py-2.5 rounded-full text-sm font-medium border border-[#DADCE0] text-[#5F6368] hover:bg-[#F1F3F4]">
                  Unsubmit
                </button>
              )}
            </div>
          )}

          {/* ─── TEACHER VIEW: Overview panel ─── */}
          {isTeacher && (
            <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#202124]">Assignment Overview</h3>
              <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]">
                <div className="w-10 h-10 rounded-full bg-[#E8F0FE] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="#1967D2" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                </div>
                <div>
                  <p className="text-xs text-[#5F6368]">Status</p>
                  <p className="text-sm font-medium text-[#202124]">{asgn.status === 'published' ? 'Published' : 'Draft'}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/course/${classroomId}/assignment/${id}/submissions`)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-[#1967D2] border border-[#DADCE0] rounded-full hover:bg-[#E8F0FE] font-medium"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                View Student Submissions
              </button>
            </div>
          )}

          {/* Due date / points card */}
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
