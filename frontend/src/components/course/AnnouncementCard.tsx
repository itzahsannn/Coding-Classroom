interface Announcement {
  id: string
  type: 'assignment' | 'post'
  authorName: string
  authorInitial: string
  authorColor: string
  postedTime: string
  body: string
  hasAssignment: boolean
  assignmentId?: string
  points?: number
  comments: number
  likes: number
}

interface AnnouncementCardProps {
  announcement: Announcement
  isTeacher: boolean
  onOpen: () => void
  onOpenAssignment?: () => void
}

const AnnouncementCard = ({ announcement, isTeacher, onOpen, onOpenAssignment }: AnnouncementCardProps) => {
  const { authorName, authorInitial, authorColor, postedTime, body, hasAssignment, comments, likes } = announcement

  return (
    <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1" style={{ backgroundColor: authorColor }} />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
              style={{ backgroundColor: authorColor }}
            >
              {authorInitial}
            </div>
            <div>
              <p className="text-sm font-medium text-[#202124]">{authorName}</p>
              <p className="text-xs text-[#5F6368]">{postedTime}</p>
            </div>
          </div>

          {isTeacher && (
            <button className="p-1 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          )}
        </div>

        <p className="text-sm text-[#3C4043] leading-relaxed mb-3">{body}</p>

        {/* Open Assignment button */}
        {hasAssignment && onOpenAssignment && (
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onOpenAssignment}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#1967D2] text-white text-sm font-medium rounded-full hover:bg-[#1557B0] transition-colors"
            >
              Open Assignment →
            </button>
            {announcement.points !== undefined && (
              <span className="text-sm text-[#5F6368]">{announcement.points} points</span>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-[#F1F3F4] flex items-center justify-between">
        <button
          onClick={onOpen}
          className="flex items-center gap-1.5 text-xs text-[#5F6368] hover:text-[#1967D2] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
          {comments} Class Comments
        </button>

        {likes > 0 && (
          <div className="flex items-center gap-1 text-xs text-[#5F6368]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
            </svg>
            {likes}+ Reactions
          </div>
        )}
      </div>
    </div>
  )
}

export default AnnouncementCard
