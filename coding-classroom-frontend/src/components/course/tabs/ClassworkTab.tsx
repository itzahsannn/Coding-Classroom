import { useNavigate } from 'react-router-dom'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export const ClassworkTab = ({ isTeacher }: { isTeacher: boolean }) => {
  const navigate = useNavigate()
  const { data: assignments, loading } = useFetch(api.getAllAssignments)

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {isTeacher && (
        <div className="mb-6 border-b border-[#E0E0E0] pb-6">
          <button
            onClick={() => navigate('/course/teacher/assignment/new')}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1967D2] text-white text-sm font-medium rounded-full shadow-sm hover:bg-[#1557B0] hover:shadow transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Create
          </button>
        </div>
      )}

      <div className="space-y-4">
        {assignments?.map((asn) => (
          <div
            key={asn.id}
            onClick={() => navigate(isTeacher ? `/course/teacher/assignment/${asn.id}` : `/course/student/assignment/${asn.id}`)}
            className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-sm hover:shadow transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E8EAED] group-hover:bg-[#1967D2] transition-colors flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#5F6368] group-hover:text-white transition-colors">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[15px] font-medium text-[#202124] group-hover:text-[#1967D2] transition-colors">{asn.title}</h3>
                <p className="text-xs text-[#5F6368] mt-0.5">{asn.postedBy} • {asn.postedTime}</p>
              </div>
            </div>
            <div className="mt-3 md:mt-0 md:ml-4 text-right">
              <span className="text-xs font-medium text-[#5F6368]">Due {asn.due.replace('Due ', '')}</span>
            </div>
          </div>
        ))}
        {assignments?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#5F6368]">This is where you'll assign work</p>
          </div>
        )}
      </div>
    </div>
  )
}
