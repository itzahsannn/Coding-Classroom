import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import DashboardTopBar from '@/components/layout/DashboardTopBar'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface UploadedFile {
  name: string
  path: string
  size: number
}

export default function TeacherSubmissionsPage() {
  const { classroomId, id } = useParams<{ classroomId: string; id: string }>()
  const navigate = useNavigate()

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [studentFiles, setStudentFiles] = useState<UploadedFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  
  // Grading state for the selected student
  const [scoreInput, setScoreInput] = useState('')
  const [savingGrade, setSavingGrade] = useState(false)

  const { data: course, loading: courseLoading } = useFetch(
    () => api.getCourseDetails(classroomId!), [classroomId]
  )
  const { data: assignment, loading: asgnLoading } = useFetch(
    () => api.getAssignmentById(id || ''), [id]
  )
  const { data: people, loading: peopleLoading } = useFetch(
    () => api.getPeople(classroomId!), [classroomId]
  )
  
  // We manage submissions in local state so we can update it optimistically after grading
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)

  useEffect(() => {
    if (!id) return
    api.getSubmissionsForAssignment(id).then(data => {
      setSubmissions(data || [])
      setLoadingSubmissions(false)
    }).catch(err => {
      console.error(err)
      setLoadingSubmissions(false)
    })
  }, [id])

  // Combine students with their submissions
  const roster = useMemo(() => {
    if (!people) return []
    return people.students.map(student => {
      const sub = submissions.find(s => s.student_id === student.id)
      const grade = Array.isArray(sub?.grades) && sub.grades.length > 0 ? sub.grades[0].score : null
      return {
        ...student,
        submission: sub || null,
        grade,
      }
    })
  }, [people, submissions])

  const selectedStudentData = useMemo(() => {
    return roster.find(s => s.id === selectedStudentId)
  }, [roster, selectedStudentId])

  // Fetch files when a student is selected
  useEffect(() => {
    if (!id || !selectedStudentId || !selectedStudentData?.submission) {
      setStudentFiles([])
      return
    }
    setLoadingFiles(true)
    api.listStudentSubmissionFiles(id, selectedStudentId)
      .then(setStudentFiles)
      .catch(console.error)
      .finally(() => setLoadingFiles(false))
  }, [id, selectedStudentId, selectedStudentData])

  // Set the input score when changing students
  useEffect(() => {
    if (selectedStudentData?.grade !== null && selectedStudentData?.grade !== undefined) {
      setScoreInput(selectedStudentData.grade.toString())
    } else {
      setScoreInput('')
    }
  }, [selectedStudentData])

  const handleDownload = async (file: UploadedFile) => {
    try {
      const url = await api.getSubmissionFileUrl(file.path)
      window.open(url, '_blank')
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  const handleSaveGrade = async () => {
    if (!selectedStudentData?.submission?.id) return
    const scoreNum = parseInt(scoreInput, 10)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > (assignment?.points || 100)) return
    
    setSavingGrade(true)
    try {
      await api.gradeSubmission(selectedStudentData.submission.id, scoreNum)
      // Optimistically update
      setSubmissions(prev => prev.map(s => {
        if (s.id === selectedStudentData.submission.id) {
          return { ...s, grades: [{ score: scoreNum }] }
        }
        return s
      }))
    } catch (err) {
      console.error(err)
      alert('Failed to save grade.')
    } finally {
      setSavingGrade(false)
    }
  }

  if (courseLoading || asgnLoading || peopleLoading || loadingSubmissions || !course || !assignment) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-full bg-[#FAF9F6] flex flex-col font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DashboardTopBar breadcrumbs={
        <>
          <button onClick={() => navigate(`/course/${classroomId}`)} className="hover:text-[#1967D2] transition-colors">{course.name}</button>
          <span className="mx-2 text-gray-400">›</span>
          <button onClick={() => navigate(`/course/${classroomId}/assignment/${id}`)} className="hover:text-[#1967D2] transition-colors">{assignment.title}</button>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-[#202124] font-medium">Submissions</span>
        </>
      }/>

      <div className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
        {/* Left Column: Student List */}
        <div className="w-full md:w-80 shrink-0 bg-white rounded-lg border border-[#E0E0E0] shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)]">
          <div className="p-4 border-b border-[#E0E0E0] bg-[#F8F9FA]">
            <h2 className="text-base font-semibold text-[#202124]">Student Submissions</h2>
            <p className="text-xs text-[#5F6368] mt-1">{roster.filter(s => s.submission).length} / {roster.length} turned in</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {roster.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full flex items-center justify-between p-4 border-b border-[#F1F3F4] text-left transition-colors ${
                  selectedStudentId === student.id ? 'bg-[#E8F0FE]' : 'hover:bg-[#F8F9FA]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0" style={{ backgroundColor: student.color }}>
                    {student.initial}
                  </div>
                  <span className={`text-sm font-medium truncate ${selectedStudentId === student.id ? 'text-[#1967D2]' : 'text-[#3C4043]'}`}>
                    {student.name}
                  </span>
                </div>
                
                <div className="shrink-0 ml-2">
                  {student.grade !== null && student.grade !== undefined ? (
                    <span className="text-xs font-bold text-[#137333]">{student.grade} / {assignment.points}</span>
                  ) : student.submission ? (
                    <span className="text-xs font-medium text-[#1967D2] bg-[#E8F0FE] px-2 py-0.5 rounded-full">Turned in</span>
                  ) : (
                    <span className="text-xs text-[#9AA0A6] italic">Missing</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Grading Detail Panel */}
        <div className="flex-1 bg-white rounded-lg border border-[#E0E0E0] shadow-sm flex flex-col h-[calc(100vh-120px)] overflow-hidden">
          {!selectedStudentData ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#9AA0A6]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mb-4 opacity-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <p>Select a student to view their submission</p>
            </div>
          ) : !selectedStudentData.submission ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#9AA0A6]">
              <div className="w-16 h-16 bg-[#F1F3F4] rounded-full flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <p className="text-[#3C4043] font-medium">{selectedStudentData.name} has not submitted yet.</p>
            </div>
          ) : (
            <>
              {/* Grading Header */}
              <div className="p-5 border-b border-[#E0E0E0] flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0" style={{ backgroundColor: selectedStudentData.color }}>
                    {selectedStudentData.initial}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#202124]">{selectedStudentData.name}</h3>
                    <p className="text-xs text-[#5F6368]">
                      Submitted on {new Date(selectedStudentData.submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="0" 
                      max={assignment.points}
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)}
                      placeholder="--"
                      className="w-16 h-10 text-center font-semibold text-[#202124] border border-[#DADCE0] rounded-md outline-none focus:border-[#1967D2]"
                    />
                    <span className="text-sm font-medium text-[#5F6368]">/ {assignment.points}</span>
                  </div>
                  <button 
                    onClick={handleSaveGrade}
                    disabled={savingGrade || !scoreInput}
                    className="px-4 py-2 bg-[#1967D2] hover:bg-[#1557B0] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                  >
                    {savingGrade ? 'Saving...' : 'Return Grade'}
                  </button>
                </div>
              </div>

              {/* Submission Content (Files & Code) */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
                
                {/* Downloadable Files */}
                {loadingFiles ? (
                  <div className="flex justify-center my-8"><LoadingSpinner /></div>
                ) : studentFiles.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-sm font-medium text-[#202124] mb-3">Attached Files</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {studentFiles.map(f => (
                        <div key={f.path} onClick={() => handleDownload(f)} className="flex items-center gap-3 p-3 bg-white border border-[#DADCE0] rounded-lg cursor-pointer hover:border-[#1967D2] hover:shadow-sm transition-all group">
                          <svg viewBox="0 0 24 24" fill="#1967D2" className="w-6 h-6 shrink-0"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#3C4043] truncate group-hover:text-[#1967D2]">{f.name}</p>
                            <p className="text-xs text-[#9AA0A6]">{(f.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submitted Code (if from playground) */}
                {selectedStudentData.submission.code && !selectedStudentData.submission.code.startsWith('/* Student uploaded files') && (
                  <div>
                    <h4 className="text-sm font-medium text-[#202124] mb-3">
                      Submitted Code <span className="text-xs font-normal text-[#5F6368]">({selectedStudentData.submission.filename})</span>
                    </h4>
                    <div className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#333]">
                      <div className="flex items-center px-4 py-2 bg-[#2D2D2D] border-b border-[#404040]">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                        </div>
                        <span className="ml-4 text-xs font-mono text-[#858585]">{selectedStudentData.submission.filename}</span>
                      </div>
                      <div className="p-4 overflow-x-auto text-sm font-mono text-[#D4D4D4]">
                        <pre><code>{selectedStudentData.submission.code}</code></pre>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
