import type { Classroom } from '@/types'

interface CourseHeaderProps {
  course: Classroom
  isTeacher: boolean
}

const CourseHeader = ({ course, isTeacher }: CourseHeaderProps) => {
  return (
    <div className="relative bg-[#F28B82] overflow-hidden" style={{ height: '200px' }}>
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="white"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
      </div>

      <div className="absolute right-8 bottom-0 opacity-70">
        <svg width="140" height="160" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="70" cy="140" rx="35" ry="12" fill="rgba(0,0,0,0.15)"/>
          <rect x="50" y="75" width="40" height="55" rx="6" fill="#B45309"/>
          <circle cx="70" cy="62" r="22" fill="#FCD34D"/>
          <path d="M48 55 Q70 35 92 55" fill="#92400E"/>
          <rect x="30" y="90" width="45" height="32" rx="3" fill="white" transform="rotate(-15 52 106)"/>
          <rect x="32" y="92" width="21" height="28" rx="2" fill="#DBEAFE" transform="rotate(-15 42 106)"/>
          <rect x="54" y="88" width="21" height="28" rx="2" fill="#EFF6FF" transform="rotate(-15 64 102)"/>
          <path d="M50 95 Q35 100 30 110" stroke="#FCD34D" strokeWidth="8" strokeLinecap="round"/>
          <path d="M90 95 Q100 105 90 115" stroke="#FCD34D" strokeWidth="8" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="relative px-8 py-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(0,0,0,0.5)" className="w-3.5 h-3.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span className="text-xs text-black/60 font-medium">{course.section || 'No section'}</span>
          </div>

          <h1 className="text-2xl font-bold text-[#202124] leading-tight">{course.name}</h1>
          <p className="text-sm text-black/60 mt-1">
            {isTeacher ? 'You are the instructor' : 'Enrolled'}
            {course.class_code && isTeacher ? ` • Code: ${course.class_code}` : ''}
          </p>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-2 self-end mt-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/30 hover:bg-white/50 rounded text-xs text-[#202124] font-medium transition-colors backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              Customize
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseHeader
