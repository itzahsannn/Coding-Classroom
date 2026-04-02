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

const CoursePage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'people' | 'grades'>('stream')

  const { data: course, loading: courseLoading } = useFetch(api.getCourseDetails)
  const { data: announcements, loading: annLoading } = useFetch(api.getAnnouncements)
  const { data: upcoming, loading: upcomingLoading } = useFetch(api.getUpcoming)

  if (courseLoading || !course) return <LoadingSpinner />

  return (
    <div className="min-h-full bg-[#F8F9FA]">
      <div className="bg-white border-b border-[#E0E0E0] flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-2 text-sm text-[#5F6368]">
          <button onClick={() => navigate('/course/student')} className="hover:text-[#1967D2] transition-colors">Course</button>
          <span>›</span>
          <span className="text-[#202124] font-medium">{course.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-[#DADCE0] rounded-full px-4 py-1.5 text-sm text-[#5F6368] bg-[#F1F3F4]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <span>Search</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#E8EAED] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5F6368" className="w-5 h-5">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
      </div>

      <CourseHeader course={course} isTeacher={false} />
      <CourseTabs active={activeTab} onChange={setActiveTab} isTeacher={false} />

      {activeTab === 'stream' && (
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 shrink-0 order-2 md:order-1">
            <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F3F4]">
                <h3 className="text-sm font-medium text-[#202124]">Upcoming</h3>
                <button className="p-1 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M22 2H2v20l4-4h16V2z"/>
                  </svg>
                </button>
              </div>
              <div className="p-3 space-y-2">
                {upcomingLoading ? <LoadingSpinner /> : upcoming?.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/course/student/assignment/${item.id}`)}
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
                ))}
                {!upcomingLoading && upcoming?.length === 0 && (
                   <p className="text-xs text-[#5F6368] p-2">No upcoming work</p>
                )}
              </div>
              <div className="px-4 py-2 border-t border-[#F1F3F4]">
                <button className="text-xs text-[#1967D2] hover:underline">View all →</button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 order-1 md:order-2">
            {annLoading ? <LoadingSpinner /> : announcements?.map((ann) => (
              <AnnouncementCard
                key={ann.id}
                announcement={ann}
                isTeacher={false}
                onOpen={() => navigate(`/course/student/announcement/${ann.id}`)}
                onOpenAssignment={
                  ann.hasAssignment
                    ? () => navigate(`/course/student/assignment/${ann.assignmentId}`)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'classwork' && <ClassworkTab isTeacher={false} />}
      {activeTab === 'people' && <PeopleTab />}
    </div>
  )
}

export default CoursePage
