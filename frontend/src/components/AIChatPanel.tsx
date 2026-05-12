import { useState, useRef, useEffect } from 'react'
import { expressApi } from '@/services/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  code: string
  language: string
  onClose: () => void
}

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      nodes.push(
        <pre key={i} className="my-2 p-3 bg-[#0d0d17] border border-[#2d2a5e] rounded-lg overflow-x-auto text-xs text-violet-200 font-mono leading-relaxed">
          {lang && <div className="text-[10px] text-violet-500 mb-1 uppercase tracking-wider">{lang}</div>}
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      i++
      continue
    }

    // Heading
    if (line.startsWith('### ')) {
      nodes.push(<p key={i} className="text-xs font-bold text-violet-200 mt-2 mb-0.5">{inlineMarkdown(line.slice(4))}</p>)
      i++; continue
    }
    if (line.startsWith('## ')) {
      nodes.push(<p key={i} className="text-sm font-bold text-violet-100 mt-2 mb-1">{inlineMarkdown(line.slice(3))}</p>)
      i++; continue
    }

    // Bullet list item
    if (line.match(/^[-*] /)) {
      nodes.push(
        <div key={i} className="flex items-start gap-1.5 text-xs text-violet-100 my-0.5">
          <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-violet-500" />
          <span>{inlineMarkdown(line.slice(2))}</span>
        </div>
      )
      i++; continue
    }

    // Numbered list
    if (line.match(/^\d+\. /)) {
      const num = line.match(/^(\d+)\. /)?.[1]
      const content = line.replace(/^\d+\. /, '')
      nodes.push(
        <div key={i} className="flex items-start gap-2 text-xs text-violet-100 my-0.5">
          <span className="shrink-0 w-4 h-4 rounded-full bg-violet-800 flex items-center justify-center text-[9px] font-bold text-violet-300">{num}</span>
          <span>{inlineMarkdown(content)}</span>
        </div>
      )
      i++; continue
    }

    // Empty line → spacer
    if (line.trim() === '') {
      nodes.push(<div key={i} className="h-1.5" />)
      i++; continue
    }

    // Normal paragraph
    nodes.push(
      <p key={i} className="text-xs text-violet-100 leading-relaxed">
        {inlineMarkdown(line)}
      </p>
    )
    i++
  }

  return nodes
}

function inlineMarkdown(text: string): React.ReactNode {
  // Handle **bold**, `code`, and plain text
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1 py-0.5 bg-[#0d0d17] border border-[#2d2a5e] rounded text-violet-300 font-mono text-[11px]">{part.slice(1, -1)}</code>
    }
    return part
  })
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AIChatPanel({ code, language, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hey! I'm your **AI Coding Tutor** 🤖\n\nI can see your ${language} code. Ask me anything:\n- Why is my code not working?\n- How do I improve this function?\n- Explain what this line does`,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const apiMessages = newMessages
        .map(m => ({ role: m.role, content: m.content }))

      const result = await expressApi.post<{ reply: string }>(
        '/chat',
        { messages: apiMessages, code, language }
      )
      setMessages(prev => [...prev, { role: 'assistant', content: result.reply }])
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Error:** ${err.message || 'Something went wrong'}. Check your \`OLLAMA_API_KEY\` in \`backend/.env\`.`,
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#09091a' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1b4b] shrink-0"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f0e1f 100%)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-base shadow-lg">
            🤖
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">AI Tutor</p>
            <p className="text-[10px] text-violet-400">Ollama Cloud · {language}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-violet-400 hover:text-white hover:bg-violet-800/40 transition-all text-base"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 shrink-0 rounded-lg bg-violet-800/60 flex items-center justify-center text-xs mt-0.5">
                🤖
              </div>
            )}
            <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-tr-sm'
                : 'bg-[#13132b] border border-[#2d2a5e] rounded-tl-sm'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-xs leading-relaxed text-white">{msg.content}</p>
              ) : (
                <div className="space-y-1">{renderMarkdown(msg.content)}</div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 shrink-0 rounded-lg bg-violet-600 flex items-center justify-center text-xs mt-0.5">
                👤
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start gap-2">
            <div className="w-6 h-6 shrink-0 rounded-lg bg-violet-800/60 flex items-center justify-center text-xs">🤖</div>
            <div className="bg-[#13132b] border border-[#2d2a5e] px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-[#1e1b4b] shrink-0">
        <div className="flex gap-2 items-center bg-[#13132b] border border-[#2d2a5e] rounded-xl px-3 py-2 focus-within:border-violet-500 transition-colors">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your code..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs text-white placeholder-[#4a4870] outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 flex items-center justify-center transition-all shrink-0 shadow-md"
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="text-[9px] text-violet-700 mt-1.5 text-center">Enter to send · AI sees your current code</p>
      </div>
    </div>
  )
}
