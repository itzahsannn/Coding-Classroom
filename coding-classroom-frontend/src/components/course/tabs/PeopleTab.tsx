import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export const PeopleTab = () => {
  const { data: people, loading } = useFetch(api.getPeople)

  if (loading || !people) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
      <section>
        <div className="flex items-center justify-between border-b border-[#1967D2] pb-4 mb-4">
          <h2 className="text-[32px] text-[#1967D2]">Teachers</h2>
        </div>
        <div className="space-y-2">
          {people.teachers.map(teacher => (
            <div key={teacher.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[#F8F9FA] rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0" style={{ backgroundColor: teacher.color }}>
                {teacher.initial}
              </div>
              <span className="text-sm font-medium text-[#3C4043]">{teacher.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between border-b border-[#1967D2] pb-4 mb-4">
          <h2 className="text-[32px] text-[#1967D2]">Classmates</h2>
          <span className="text-sm font-medium text-[#1967D2] mb-1.5">{people.students.length} students</span>
        </div>
        <div className="space-y-2">
          {people.students.map(student => (
            <div key={student.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#F8F9FA] rounded-lg transition-colors border-b border-[#F1F3F4] last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0" style={{ backgroundColor: student.color }}>
                  {student.initial}
                </div>
                <span className="text-sm font-medium text-[#3C4043]">{student.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
