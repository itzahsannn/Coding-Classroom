import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardTopBar from '@/components/layout/DashboardTopBar'
import { api } from '@/api'
import { useFetch } from '@/hooks/useFetch'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const COLORS = ['#1A73E8', '#EA4335', '#34A853', '#A142F4', '#F9AB00', '#E91E63', '#00ACC1', '#FF7043']

interface CalendarEvent {
  title: string
  color: string
  classroomId: string
  assignmentId: string
}

interface CalendarDay {
  num: number
  disabled: boolean
  isToday: boolean
  events: CalendarEvent[]
}

function buildCalendarGrid(year: number, month: number, events: Map<string, CalendarEvent[]>): CalendarDay[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const today = new Date()

  const grid: CalendarDay[] = []

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    grid.push({ num: daysInPrevMonth - i, disabled: true, isToday: false, events: [] })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d
    grid.push({ num: d, disabled: false, isToday, events: events.get(key) || [] })
  }

  // Fill to complete grid (35 or 42 cells)
  const totalCells = grid.length <= 35 ? 35 : 42
  for (let d = 1; grid.length < totalCells; d++) {
    grid.push({ num: d, disabled: true, isToday: false, events: [] })
  }

  return grid
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(() => new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const { data: assignments } = useFetch(() => api.getCalendarAssignments(), [])

  // Build event map keyed by "YYYY-MM-DD"
  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    if (!assignments) return map

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(assignments as any[]).forEach((a, i) => {
      if (!a.deadline) return
      const d = new Date(a.deadline)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const existing = map.get(key) || []
      existing.push({
        title: a.title,
        color: COLORS[i % COLORS.length],
        classroomId: a.classroom_id,
        assignmentId: a.id,
      })
      map.set(key, existing)
    })
    return map
  }, [assignments])

  const calendarDays = useMemo(() => buildCalendarGrid(year, month, eventMap), [year, month, eventMap])
  const rows = Math.ceil(calendarDays.length / 7)

  const goToday = useCallback(() => setCurrentDate(new Date()), [])
  const goPrev = useCallback(() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)), [])
  const goNext = useCallback(() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)), [])

  return (
    <div className="min-h-full bg-[#FAF9F6] font-sans flex flex-col h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <DashboardTopBar
        breadcrumbs={
          <>
            <button onClick={() => navigate('/dashboard')} className="hover:text-[#1967D2] transition-colors">Dashboard</button>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-[#202124] font-medium">Calendar</span>
          </>
        }
      />

      <div className="flex-1 flex flex-col p-4 md:p-6 max-w-[1200px] w-full mx-auto">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#111827]">
              {MONTHS[month]} {year}
            </h1>
            <div className="flex items-center gap-1">
              <button onClick={goPrev} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button onClick={goNext} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <button onClick={goToday} className="px-4 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 ml-2 transition-colors">
              Today
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-sm flex flex-col">
          <div className="min-w-[800px] flex-1 flex flex-col">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-white py-3">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-500">{day}</div>
              ))}
            </div>

            {/* Date Cells */}
            <div className="flex-1 grid grid-cols-7" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
              {calendarDays.map((date, i) => (
                <div
                  key={i}
                  className={`border-r border-b border-gray-100 p-2 flex flex-col min-h-[80px] ${
                    date.disabled ? 'text-gray-300 bg-gray-50/50' : 'text-gray-900 bg-white'
                  }`}
                >
                  <div className="flex justify-end mb-1">
                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                      date.isToday ? 'bg-[#1A73E8] text-white' : ''
                    }`}>
                      {date.num}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {date.events.map((evt, j) => (
                      <div
                        key={j}
                        onClick={() => navigate(`/course/${evt.classroomId}/assignment/${evt.assignmentId}`)}
                        className="px-2 py-1 text-xs font-semibold text-white rounded cursor-pointer truncate shadow-sm transition-opacity hover:opacity-80"
                        style={{ backgroundColor: evt.color }}
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
