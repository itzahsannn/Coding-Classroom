import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export const GradesTab = ({ classroomId }: { classroomId?: string }) => {
  const { data: grades, loading } = useFetch(
    () => api.getGrades(classroomId!), [classroomId]
  )

  if (loading || !grades) return <LoadingSpinner />

  return (
    <div className="px-6 py-6 w-full overflow-x-auto">
      <div className="min-w-max border border-[#E0E0E0] rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E0E0E0]">
              <th className="p-4 w-64 border-r border-[#E0E0E0]">
                <span className="text-sm font-medium text-[#5F6368]">Students</span>
              </th>
              {grades.assignments.map((asgn: any) => (
                <th key={asgn.id} className="p-4 w-40 text-center border-r border-[#E0E0E0] last:border-r-0">
                  <div className="text-sm font-medium text-[#202124] truncate px-2">{asgn.title}</div>
                  <div className="text-xs text-[#5F6368] font-normal mt-0.5">out of {asgn.outOf}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grades.students.length === 0 && (
              <tr><td colSpan={grades.assignments.length + 1} className="p-8 text-center text-sm text-[#5F6368]">No submissions yet.</td></tr>
            )}
            {grades.students.map((student: any) => (
              <tr key={student.id} className="border-b border-[#E0E0E0] last:border-0 hover:bg-[#F1F3F4] transition-colors">
                <td className="p-4 border-r border-[#E0E0E0]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0" style={{ backgroundColor: student.color }}>
                      {student.initial}
                    </div>
                    <span className="text-[13px] font-medium text-[#3C4043] truncate">{student.name}</span>
                  </div>
                </td>
                {grades.assignments.map((asgn: any) => {
                  const score = student.grades[asgn.id]
                  return (
                    <td key={asgn.id} className="p-4 text-center border-r border-[#E0E0E0] last:border-r-0">
                      {score !== undefined ? (
                        score !== null ? (
                          <div className="inline-block px-3 py-1 bg-green-50 text-green-700 font-medium text-sm rounded">{score}</div>
                        ) : (
                          <span className="text-sm text-[#1967D2] font-medium">Turned in</span>
                        )
                      ) : (
                        <span className="text-sm text-[#9AA0A6] italic">Missing</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
