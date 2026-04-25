import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export const PeopleTab = ({ classroomId }: { classroomId?: string }) => {
  const { data: people, loading } = useFetch(
    () => api.getPeople(classroomId!), [classroomId]
  )

  if (loading || !people) return <LoadingSpinner />

  return (
    <div className="max-w-[50rem] mx-auto px-6 py-8 space-y-12 font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <section>
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Teachers</h2>
        </div>
        <div className="space-y-0 text-sm">
          {people.teachers.map((teacher: any, index: number) => (
            <div key={teacher.id} className={`flex items-center justify-between py-4 ${index !== people.teachers.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold shrink-0"
                  style={{ backgroundColor: teacher.color || '#F3F4F6', color: '#fff' }}>
                  {teacher.initial}
                </div>
                <span className="font-medium text-[#374151]">{teacher.name}</span>
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Students</h2>
        </div>
        <div className="space-y-0 text-sm">
          {people.students.length === 0 && (
            <div className="py-8 text-center text-[#5F6368]">No students enrolled yet.</div>
          )}
          {people.students.map((student: any, index: number) => (
            <div key={student.id} className={`flex items-center justify-between py-4 ${index !== people.students.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold shrink-0"
                  style={{ backgroundColor: student.color || '#F3F4F6', color: '#fff' }}>
                  {student.initial}
                </div>
                <span className="font-medium text-[#374151]">{student.name}</span>
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
