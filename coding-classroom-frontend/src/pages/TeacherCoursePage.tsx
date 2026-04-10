import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import CourseHeader from '@/components/course/CourseHeader'
import CourseTabs from '@/components/course/CourseTabs'
import AnnouncementCard from '@/components/course/AnnouncementCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'

import { ClassworkTab } from '@/components/course/tabs/ClassworkTab'
import { PeopleTab } from '@/components/course/tabs/PeopleTab'
import { GradesTab } from '@/components/course/tabs/GradesTab'
import DashboardTopBar from '@/components/layout/DashboardTopBar'

const TeacherCoursePage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'people' | 'grades'>('stream')
  const [announceText, setAnnounceText] = useState('')
  const [posting, setPosting] = useState(false)

  const { data: course, loading: courseLoading } = useFetch(api.getCourseDetails)
  const { data: announcements, loading: annLoading, refetch: refetchAnn } = useFetch(api.getAnnouncements)

  const handlePost = async () => {
    if (!announceText.trim()) return
    setPosting(true)
    await api.createAnnouncement(announceText)
    setAnnounceText('')
    setPosting(false)
    refetchAnn()
  }

  if (courseLoading || !course) return <LoadingSpinner />

  return (
    <div className="min-h-full bg-[#F8F9FA] flex flex-col">
      <DashboardTopBar 
        breadcrumbs={
          <>
            <button onClick={() => navigate('/course/teacher')} className="hover:text-[#1967D2] transition-colors">Course</button>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-[#202124] font-medium">{course.name}</span>
          </>
        }
      />

      <CourseHeader course={course} isTeacher={true} />
      <CourseTabs active={activeTab} onChange={setActiveTab} isTeacher={true} />

      {activeTab === 'stream' && (
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 shrink-0 space-y-4 order-2 md:order-1">
            <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F3F4]">
                <h3 className="text-sm font-medium text-[#202124]">To Review</h3>
                <button className="p-1 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M22 2H2v20l4-4h16V2z"/>
                  </svg>
                </button>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-[#5F6368]">No work to review</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm p-4">
              <p className="text-xs font-medium text-[#5F6368] mb-1">Class code</p>
              <p className="text-xl font-bold text-[#1967D2] tracking-wider">{course.classCode}</p>
              <button className="mt-1.5 text-xs text-[#5F6368] hover:text-[#1967D2] flex items-center gap-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                Copy
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 order-1 md:order-2">
            <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-[#1967D2] flex items-center justify-center text-white text-sm font-medium shrink-0">M</div>
                <input
                  type="text"
                  value={announceText}
                  onChange={(e) => setAnnounceText(e.target.value)}
                  placeholder="Share something with your class..."
                  className="flex-1 text-sm text-[#202124] outline-none placeholder-[#9AA0A6] bg-transparent"
                  disabled={posting}
                  onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                />
                <button
                  onClick={handlePost}
                  disabled={posting || !announceText.trim()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors shrink-0 ${
                    announceText.trim() && !posting
                      ? 'bg-[#1967D2] text-white hover:bg-[#1557B0]'
                      : 'bg-[#E8EAED] text-[#9AA0A6] cursor-not-allowed'
                  }`}
                >
                  {posting ? 'Posting...' : 'New Announcement'}
                </button>
              </div>
            </div>

            {annLoading ? <LoadingSpinner /> : announcements?.map((ann) => (
              <AnnouncementCard
                key={ann.id}
                announcement={ann}
                isTeacher={true}
                onOpen={() => navigate(`/course/teacher/announcement/${ann.id}`)}
                onOpenAssignment={
                  ann.hasAssignment
                    ? () => navigate('/course/teacher/assignment/new')
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'classwork' && <ClassworkTab isTeacher={true} />}
      {activeTab === 'people' && <PeopleTab />}
      {activeTab === 'grades' && <GradesTab />}
    </div>
  )
}

export default TeacherCoursePage
