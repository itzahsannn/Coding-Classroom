import DashboardTopBar from '@/components/layout/DashboardTopBar'
import { useState } from 'react'

export default function CalendarPage() {
  const [currentDate] = useState(new Date('2023-10-01'))
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Generating a static mock grid for Oct 2023 to match screenshot exactly
  const dates = [
    { num: 24, disabled: true }, { num: 25, disabled: true }, { num: 26, disabled: true }, { num: 27, disabled: true }, { num: 1, events: [] }, { num: 2, events: [] }, { num: 3, events: [] },
    { num: 4, events: [] }, { num: 5, events: [{ title: 'Course Code', color: '#1A73E8' }] }, { num: 6, events: [] }, { num: 7, events: [] }, { num: 8, events: [{ title: 'Course Code', color: '#EA4335' }] }, { num: 9, events: [] }, { num: 10, events: [] },
    { num: 11, events: [] }, { num: 12, events: [{ title: 'Course Code', color: '#34A853' }] }, { num: 13, events: [] }, { num: 14, active: true, events: [{ title: 'Course Code', color: '#A142F4' }] }, { num: 15, events: [] }, { num: 16, events: [] }, { num: 17, events: [{ title: 'Course Code', color: '#F9AB00' }] },
    { num: 18, events: [] }, { num: 19, events: [] }, { num: 20, events: [] }, { num: 21, events: [{ title: 'Course Code', color: '#9AA0A6' }] }, { num: 22, events: [] }, { num: 23, events: [] }, { num: 24, events: [] },
    { num: 25, events: [] }, { num: 26, events: [] }, { num: 27, events: [] }, { num: 28, events: [{ title: 'Course Code', color: '#1A73E8' }] }, { num: 29, events: [] }, { num: 30, events: [] }, { num: 31, events: [] },
  ]

  return (
    <div className="min-h-full bg-[#FAF9F6] font-sans flex flex-col h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DashboardTopBar 
        breadcrumbs={
          <>
            <span className="text-[#202124] font-medium text-lg">Course</span>
            <span className="mx-2 text-gray-400">›</span>
          </>
        }
      />
      
      
      <div className="flex-1 flex flex-col p-4 md:p-6 max-w-[1200px] w-full mx-auto">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#111827]">October 2023</h1>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
            <button className="px-4 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 ml-2 transition-colors">
              Today
            </button>
          </div>

          <div className="flex bg-white rounded-full border border-gray-200 p-0.5 shadow-sm">
            <button className="px-5 py-1.5 rounded-full text-sm font-medium text-gray-900 bg-white shadow-sm border border-gray-100">Month</button>
            <button className="px-5 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Week</button>
            <button className="px-5 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Day</button>
          </div>
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-sm flex flex-col">
          <div className="min-w-[800px] flex-1 flex flex-col">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-white py-3">
            {days.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5">
            {dates.map((date, i) => (
              <div 
                key={i} 
                className={`border-r border-b border-gray-100 p-2 flex flex-col ${date.disabled ? 'text-gray-400 bg-white' : 'text-gray-900 bg-white'}`}
              >
                <div className="flex justify-end mb-1">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${date.active ? 'bg-[#1A73E8] text-white' : ''}`}>
                    {date.num}
                  </span>
                </div>
                
                <div className="flex-1 space-y-1 overflow-y-auto">
                  {date.events?.map((evt, j) => (
                    <div 
                      key={j} 
                      className="px-2 py-1 text-xs font-semibold text-white rounded cursor-pointer truncate shadow-sm transition-opacity hover:opacity-90 align-left"
                      style={{ backgroundColor: evt.color }}
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
            </ div>
      </div>
    </div>
  )
}
