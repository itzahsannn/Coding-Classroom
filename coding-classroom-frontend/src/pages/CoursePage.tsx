import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import DashboardTopBar from '@/components/layout/DashboardTopBar'
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
      <DashboardTopBar 
        breadcrumbs={
          <>
            <button onClick={() => navigate('/dashboard')} className="hover:text-[#1967D2] transition-colors">Course</button>
            <span>›</span>
            <span className="text-[#202124] font-medium">{course.name}</span>
          </>
        }
      />

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
