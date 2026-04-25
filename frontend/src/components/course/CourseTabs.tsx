type Tab = 'stream' | 'classwork' | 'people' | 'grades'

interface CourseTabsProps {
  active: string
  onChange: (tab: Tab) => void
  isTeacher: boolean
}

const CourseTabs = ({ active, onChange, isTeacher }: CourseTabsProps) => {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'stream', label: 'Stream' },
    { id: 'classwork', label: 'Classwork' },
    { id: 'people', label: 'People' },
    ...(isTeacher ? [{ id: 'grades' as Tab, label: 'Grades' }] : []),
  ]

  return (
    <div className="bg-white border-b border-[#E0E0E0] flex items-center justify-between px-2">
      <div className="flex items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              active === tab.id
                ? 'border-[#1967D2] text-[#1967D2]'
                : 'border-transparent text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isTeacher && (
        <div className="flex items-center gap-1 pr-2">
          <button className="p-2 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors" title="Course calendar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </button>
          <button className="p-2 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96a6.97 6.97 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.04.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default CourseTabs
