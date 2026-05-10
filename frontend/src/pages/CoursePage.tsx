import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import { useAuth } from '@/context/AuthContext'
import DashboardTopBar from '@/components/layout/DashboardTopBar'
import CourseHeader from '@/components/course/CourseHeader'
import CourseTabs from '@/components/course/CourseTabs'
import AnnouncementCard from '@/components/course/AnnouncementCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'

import { ClassworkTab } from '@/components/course/tabs/ClassworkTab'
import { PeopleTab } from '@/components/course/tabs/PeopleTab'
import { GradesTab } from '@/components/course/tabs/GradesTab'

const CoursePage = () => {
  const { classroomId } = useParams<{ classroomId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'people' | 'grades'>('stream')
  const [announceText, setAnnounceText] = useState('')
  const [posting, setPosting] = useState(false)

  const { data: course, loading: courseLoading } = useFetch(
    () => api.getCourseDetails(classroomId!),
    [classroomId]
  )
  const { data: announcements, loading: annLoading, refetch: refetchAnn } = useFetch(
    () => api.getAnnouncements(classroomId!),
    [classroomId]
  )
  const { data: upcoming, loading: upcomingLoading } = useFetch(
    () => api.getUpcoming(classroomId!),
    [classroomId]
  )

  const isTeacher = course?.instructor_id === user?.id

  const handlePost = async () => {
    if (!announceText.trim() || !classroomId) return
    setPosting(true)
    try {
      await api.createAnnouncement(classroomId, announceText)
      setAnnounceText('')
      refetchAnn()
    } catch (err) {
      console.error('Failed to post announcement:', err)
    } finally {
      setPosting(false)
    }
  }

  if (courseLoading || !course) return <LoadingSpinner />

  return (
    <div className="min-h-full bg-[#F8F9FA] flex flex-col">
      <DashboardTopBar 
        breadcrumbs={
          <>
            <button onClick={() => navigate('/dashboard')} className="hover:text-[#1967D2] transition-colors">Course</button>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-[#202124] font-medium">{course.name}</span>
          </>
        }
      />

      <CourseHeader course={course} isTeacher={isTeacher} />
      <CourseTabs active={activeTab} onChange={setActiveTab} isTeacher={isTeacher} />

      {activeTab === 'stream' && (
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 shrink-0 space-y-4 order-2 md:order-1">
            {/* Upcoming / To Review sidebar */}
            <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F3F4]">
                <h3 className="text-sm font-medium text-[#202124]">
                  {isTeacher ? 'To Review' : 'Upcoming'}
                </h3>
                <button className="p-1 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M22 2H2v20l4-4h16V2z"/>
                  </svg>
                </button>
              </div>
              <div className="p-3 space-y-2">
                {isTeacher ? (
                  <p className="text-xs text-[#5F6368] p-2">No work to review</p>
                ) : upcomingLoading ? (
                  <LoadingSpinner />
                ) : upcoming && upcoming.length > 0 ? (
                  upcoming.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/course/${classroomId}/assignment/${item.id}`)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-medium px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">{item.due || 'Due'}</span>
                        <span className="text-xs text-[#5F6368]">{item.dueDate}</span>
                      </div>
                      <p className="text-sm text-[#3C4043] group-hover:text-[#1967D2] transition-colors font-medium leading-tight">
                        {item.title}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-[#5F6368] p-2">No upcoming work</p>
                )}
              </div>
              {!isTeacher && (
                <div className="px-4 py-2 border-t border-[#F1F3F4]">
                  <button className="text-xs text-[#1967D2] hover:underline">View all →</button>
                </div>
              )}
            </div>

            {/* Class code (teacher only) */}
            {isTeacher && (
              <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm p-4">
                <p className="text-xs font-medium text-[#5F6368] mb-1">Class code</p>
                <p className="text-xl font-bold text-[#1967D2] tracking-wider">{course.class_code}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(course.class_code)}
                  className="mt-1.5 text-xs text-[#5F6368] hover:text-[#1967D2] flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                  Copy
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4 order-1 md:order-2">
            {/* Announcement composer (teacher only) */}
            {isTeacher && (
              <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-[#1967D2] flex items-center justify-center text-white text-sm font-medium shrink-0">
                    {user?.user_metadata?.name?.charAt(0)?.toUpperCase() || 'I'}
                  </div>
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
            )}

            {/* Announcement list */}
            {annLoading ? <LoadingSpinner /> : announcements?.map((ann: any) => (
              <AnnouncementCard
                key={ann.id}
                announcement={{
                  id: ann.id,
                  type: 'post',
                  authorName: ann.author_name || 'User',
                  authorInitial: ann.author_initial || '?',
                  authorColor: ann.author_color || '#1967D2',
                  postedTime: ann.created_at ? new Date(ann.created_at).toLocaleDateString() : '',
                  body: ann.body,
                  hasAssignment: false,
                  assignmentId: undefined,
                  points: undefined,
                  comments: ann.comment_count || 0,
                  likes: 0,
                }}
                isTeacher={isTeacher}
                onOpen={() => navigate(`/course/${classroomId}/announcement/${ann.id}`)}
              />
            ))}

            {!annLoading && (!announcements || announcements.length === 0) && (
              <div className="bg-white rounded-lg border border-dashed border-[#D1D5DB] p-8 text-center">
                <p className="text-[#6B7280] text-sm">No announcements yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'classwork' && <ClassworkTab isTeacher={isTeacher} classroomId={classroomId} />}
      {activeTab === 'people' && <PeopleTab classroomId={classroomId} />}
      {activeTab === 'grades' && isTeacher && <GradesTab classroomId={classroomId} />}
    </div>
  )
}

export default CoursePage
