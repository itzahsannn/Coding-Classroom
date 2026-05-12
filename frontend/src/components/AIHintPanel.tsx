import { useState } from 'react'
import { expressApi } from '@/services/api'

interface Props {
  code: string
  language: string
  assignmentDescription: string
  onClose: () => void
}

const HINT_CONFIG = [
  {
    label: 'Conceptual Hint',
    emoji: '💭',
    color: 'from-blue-900/40 to-blue-950/40',
    border: 'border-blue-700/40',
    text: 'text-blue-200',
    badge: 'bg-blue-800/60 text-blue-300',
    dot: 'bg-blue-400',
  },
  {
    label: 'Pointed Hint',
    emoji: '🔍',
    color: 'from-amber-900/40 to-amber-950/40',
    border: 'border-amber-700/40',
    text: 'text-amber-200',
    badge: 'bg-amber-800/60 text-amber-300',
    dot: 'bg-amber-400',
  },
  {
    label: 'Near-Solution',
    emoji: '🎯',
    color: 'from-rose-900/40 to-rose-950/40',
    border: 'border-rose-700/40',
    text: 'text-rose-200',
    badge: 'bg-rose-800/60 text-rose-300',
    dot: 'bg-rose-400',
  },
]

export default function AIHintPanel({ code, language, assignmentDescription, onClose }: Props) {
  const [revealedHints, setRevealedHints] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const nextLevel = revealedHints.length
  const allRevealed = nextLevel >= 3

  const fetchNextHint = async () => {
    if (allRevealed || isLoading) return
    setIsLoading(true)
    try {
      const result = await expressApi.post<{ hint: string }>(
        '/hint',
        { code, language, hintLevel: nextLevel, assignmentDescription }
      )
      setRevealedHints(prev => [...prev, result.hint])
    } catch (err: any) {
      setRevealedHints(prev => [...prev, `Error fetching hint: ${err.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="shrink-0 border-t border-[#1a1235] flex flex-col" style={{ background: '#09091a', maxHeight: '52%' }}>
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#1a1235] flex items-center justify-between shrink-0"
        style={{ background: 'linear-gradient(135deg, #1a1235 0%, #0d0a1e 100%)' }}>
        <div className="flex items-center gap-3">
          <span className="text-sm">💡</span>
          <span className="text-[11px] uppercase font-bold text-purple-300 tracking-wider">AI Hints</span>

          {/* Progress dots */}
          <div className="flex gap-1.5 items-center">
            {HINT_CONFIG.map((cfg, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < revealedHints.length ? cfg.dot : 'bg-[#2a1f4a]'
                }`}
              />
            ))}
          </div>

          <span className="text-[10px] text-purple-600">
            {revealedHints.length}/3 revealed
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-purple-400 hover:text-white hover:bg-purple-800/40 transition-all text-sm"
        >
          ✕
        </button>
      </div>

      {/* Hints list */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {revealedHints.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="text-3xl mb-3">🤔</div>
            <p className="text-xs text-purple-400 max-w-48 leading-relaxed">
              Stuck? Get a hint — start vague and reveal more only if needed.
            </p>
          </div>
        )}

        {revealedHints.map((hint, i) => {
          const cfg = HINT_CONFIG[i]
          return (
            <div key={i} className={`bg-gradient-to-br ${cfg.color} border ${cfg.border} rounded-xl p-3.5`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{cfg.emoji}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
              <p className={`text-xs ${cfg.text} leading-relaxed`}>{hint}</p>
            </div>
          )
        })}

        {/* Get Hint button */}
        {!allRevealed && (
          <button
            onClick={fetchNextHint}
            disabled={isLoading}
            className="w-full py-3 rounded-xl border border-dashed border-purple-700/60 text-purple-400 hover:text-purple-200 hover:border-purple-500 hover:bg-purple-900/20 text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 019.8 8" strokeLinecap="round" />
                </svg>
                Generating hint...
              </>
            ) : (
              <>
                {HINT_CONFIG[nextLevel].emoji} Reveal {HINT_CONFIG[nextLevel].label}
              </>
            )}
          </button>
        )}

        {allRevealed && (
          <div className="text-center py-3">
            <p className="text-xs text-purple-600">All hints revealed — you've got this! 💪</p>
          </div>
        )}
      </div>
    </div>
  )
}
