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
    <div className="bg-white border-b border-[#E0E0E0] flex items-center px-2">
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
  )
}

export default CourseTabs
