import DashboardTopBar from '@/components/layout/DashboardTopBar'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '@/api'
import { expressApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import Editor, { type OnMount } from '@monaco-editor/react'

// ─── Supported Languages ───────────────────────────────────────────

interface Language {
  id: string
  label: string
  ext: string
  monacoId: string
  icon: string
  boilerplate: string
}

const LANGUAGES: Language[] = [
  {
    id: 'python',
    label: 'Python',
    ext: '.py',
    monacoId: 'python',
    icon: '🐍',
    boilerplate: `# Write your Python code here\n\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()\n`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    ext: '.js',
    monacoId: 'javascript',
    icon: '⚡',
    boilerplate: `// Write your JavaScript code here\n\nfunction main() {\n  console.log("Hello, World!");\n}\n\nmain();\n`,
  },
]

// ─── Component ─────────────────────────────────────────────────────

export default function CodingPlaygroundPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const assignmentId = searchParams.get('assignmentId')
  const classroomId = searchParams.get('classroomId')
  // filePath is passed when opening a specific uploaded student file
  const filePath = searchParams.get('filePath')
  const editorRef = useRef<any>(null)
  const { role } = useAuth()
  const isStudent = role === 'student'

  const [language, setLanguage] = useState<Language>(LANGUAGES[0])
  const [code, setCode] = useState(LANGUAGES[0].boilerplate)
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [output, setOutput] = useState<string | null>(null)
  const [outputType, setOutputType] = useState<'success' | 'error' | 'info'>('info')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [terminalExpanded, setTerminalExpanded] = useState(false)
  const [validAssignment, setValidAssignment] = useState<boolean | null>(null)

  // Submit modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitFilename, setSubmitFilename] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // If a specific filePath is given, load that file's content from Supabase Storage
  useEffect(() => {
    if (!filePath) return
    const rawFileName = filePath.split('/').pop() || 'file'
    const fileName = rawFileName.includes('_') ? rawFileName.substring(rawFileName.indexOf('_') + 1) : rawFileName
    
    const lang = LANGUAGES.find(l => fileName.endsWith(l.ext)) || LANGUAGES[0]
    setLanguage(lang)
    setLoadedFileName(fileName)
    setValidAssignment(!!assignmentId)

    // Get a signed URL and fetch the file text
    supabase.storage
      .from('submissions')
      .createSignedUrl(filePath, 3600)
      .then(({ data }) => {
        if (!data?.signedUrl) return
        return fetch(data.signedUrl)
      })
      .then(res => res?.text())
      .then(text => {
        if (text !== undefined) setCode(text)
      })
      .catch(console.error)
  }, [filePath])

  // Load existing submission & validate assignment (only when no filePath)
  useEffect(() => {
    if (filePath) return // already handled above
    if (assignmentId) {
      api.getAssignmentById(assignmentId).then(() => {
        setValidAssignment(true)
        api.getSubmission(assignmentId).then(sub => {
          if (sub) {
            setSubmissionId(sub.id)
            const lang = LANGUAGES.find(l => sub.filename.endsWith(l.ext)) || LANGUAGES[0]
            setLanguage(lang)
            setCode(sub.code)
            setLoadedFileName(sub.filename)
            if (sub.llm_feedback) setFeedback(sub.llm_feedback)
          }
        }).catch(() => {})
      }).catch(() => {
        setValidAssignment(false)
      })
    } else {
      setValidAssignment(false)
    }
  }, [assignmentId, filePath])

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
    editor.focus()
  }

  const switchLanguage = (lang: Language) => {
    if (lang.id === language.id) return
    setLanguage(lang)
    setCode(lang.boilerplate)
    setOutput(null)
    setFeedback(null)
  }

  // ─── Run = just execute, no saving ───
  const handleRun = async () => {
    setIsRunning(true)
    setOutput(null)
    setTerminalExpanded(true)

    try {
      const result = await expressApi.post<{ stdout: string; stderr: string; exitCode: number }>(
        '/run',
        { code, language: language.id }
      )

      const stderr = (result.stderr || '').split('\n')
        .filter(line => !line.match(/^(Unable to find|Pulling from|[a-f0-9]+:|Digest:|Status:|Download|Pull|Waiting)/i))
        .join('\n').trim()

      if (result.exitCode !== 0 && stderr) {
        setOutput(result.stdout ? `${result.stdout}\n\n${stderr}` : stderr)
        setOutputType('error')
      } else {
        setOutput(result.stdout || '(no output)')
        setOutputType('success')
      }
    } catch (err: any) {
      setOutput(`Error: ${err.message || 'Execution failed'}`)
      setOutputType('error')
    } finally {
      setIsRunning(false)
    }
  }

  // ─── Submit = save to Supabase with custom filename ───
  const openSubmitModal = () => {
    if (filePath) {
      handleSaveDirectly()
    } else {
      const defaultName = language.id === 'python' ? 'solution.py' : 'solution.js'
      setSubmitFilename(defaultName)
      setSubmitSuccess(false)
      setShowSubmitModal(true)
    }
  }

  const handleSaveDirectly = async () => {
    if (!assignmentId || !filePath) return
    setIsSubmitting(true)
    try {
      // 1. Update the actual attached file in Supabase Storage
      await api.updateStorageFile(filePath, code)
      
      // 2. Upsert into the submissions table so AI Feedback has the code
      const sub = await api.submitCode(assignmentId, loadedFileName || 'solution.py', code)
      setSubmissionId(sub.id)

      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 2000)
    } catch (err: any) {
      console.error('Submit failed:', err)
      setOutput(`Error: ${err.message || 'Save failed'}`)
      setOutputType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!assignmentId || !submitFilename.trim()) return
    setIsSubmitting(true)
    try {
      const filename = submitFilename.trim()
      const sub = await api.submitCode(assignmentId, filename, code)
      setSubmissionId(sub.id)
      setSubmitSuccess(true)
      setTimeout(() => setShowSubmitModal(false), 1500)
    } catch (err: any) {
      console.error('Submit failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── AI Feedback (requires saved submission) ───
  const handleEvaluate = async () => {
    if (!submissionId) return
    setIsEvaluating(true)
    setFeedback(null)
    try {
      const result = await expressApi.post<{ feedback: string }>(
        `/submissions/${submissionId}/evaluate`
      )
      setFeedback(result.feedback)
    } catch (err: any) {
      setFeedback(`Error: ${err.message || 'Evaluation failed'}`)
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleReset = () => {
    setCode(language.boilerplate)
    setOutput(null)
    setFeedback(null)
  }

  return (
    <div className="min-h-full bg-[#1e1e1e] flex flex-col h-screen">
      <DashboardTopBar breadcrumbs={
        <>
          <button onClick={() => navigate(classroomId ? `/course/${classroomId}` : '/dashboard')} className="hover:text-[#1967D2] transition-colors">
            {classroomId ? 'Course' : 'Dashboard'}
          </button>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-[#202124] font-medium">Coding Playground</span>
        </>
      }/>

      <div className="flex-1 flex flex-col min-h-0">
        {/* ─── Toolbar ─── */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c] shrink-0">
          {/* Language Tabs */}
          <div className="flex items-center gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => switchLanguage(lang)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  language.id === lang.id
                    ? 'bg-[#1e1e1e] text-white border border-[#3c3c3c]'
                    : 'text-[#969696] hover:text-white hover:bg-[#2d2d2d]'
                }`}
              >
                <span>{lang.icon}</span>
                <span>{lang.label}</span>
              </button>
            ))}
            <div className="w-px h-6 bg-[#3c3c3c] mx-2" />
            <span className="text-xs text-[#666] font-mono">
              {submissionId ? '✓ saved' : 'unsaved'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#969696] hover:text-white hover:bg-[#2d2d2d] rounded-md transition-colors font-medium">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
              Reset
            </button>

            {/* Run — just execute */}
            <button onClick={handleRun} disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-60">
              {isRunning ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 019.8 8" strokeLinecap="round"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M8 5v14l11-7z"/></svg>
              )}
              {isRunning ? 'Running...' : 'Run'}
            </button>

            {/* Submit — save with filename (students only) */}
            {validAssignment && isStudent && (
              <button onClick={openSubmitModal} disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6a1b9a] hover:bg-[#7b1fa2] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-60">
                {isSubmitting ? (
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 019.8 8" strokeLinecap="round"/></svg>
                ) : submitSuccess ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/></svg>
                )}
                {submitSuccess ? 'Saved' : isSubmitting ? 'Saving...' : 'Submit'}
              </button>
            )}

            {/* AI Feedback — requires saved submission */}
            {submissionId && (
              <button onClick={handleEvaluate} disabled={isEvaluating}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#388e3c] hover:bg-[#43a047] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-60">
                {isEvaluating ? (
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 019.8 8" strokeLinecap="round"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                )}
                {isEvaluating ? 'Evaluating...' : 'AI Feedback'}
              </button>
            )}
          </div>
        </div>

        {/* ─── Editor + Terminal Split ─── */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sandbox warning */}
          {validAssignment === false && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#332b00] border-b border-[#665500] shrink-0">
              <svg viewBox="0 0 24 24" fill="#ffb300" className="w-4 h-4 shrink-0"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
              <span className="text-xs text-[#ffcc02]">
                <strong>Sandbox mode</strong> — you can run code, but open from an assignment to submit.{' '}
                <button onClick={() => navigate('/dashboard')} className="underline hover:text-white">Go to Dashboard</button>
              </span>
            </div>
          )}

          {/* Monaco Editor */}
          <div className={`${terminalExpanded ? 'h-[55%]' : 'flex-1'} min-h-0`}>
            <Editor
              height="100%"
              language={language.monacoId}
              value={code}
              onChange={(v) => setCode(v || '')}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
                tabSize: language.id === 'python' ? 4 : 2,
                insertSpaces: true,
                wordWrap: 'off',
                suggest: { showKeywords: true, showSnippets: true },
              }}
            />
          </div>

          {/* ─── Terminal Panel ─── */}
          <div className={`${terminalExpanded ? 'h-[45%]' : 'h-10'} flex flex-col bg-[#1e1e1e] border-t border-[#3c3c3c] shrink-0 transition-all`}>
            <button
              onClick={() => setTerminalExpanded(!terminalExpanded)}
              className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c] cursor-pointer hover:bg-[#2d2d2d] shrink-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] uppercase font-bold text-[#969696] tracking-wider">Terminal</span>
                {output !== null && !terminalExpanded && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    outputType === 'error' ? 'bg-red-900/40 text-red-400' :
                    outputType === 'success' ? 'bg-green-900/40 text-green-400' :
                    'bg-blue-900/40 text-blue-400'
                  }`}>
                    {outputType === 'error' ? 'Error' : outputType === 'success' ? 'Done' : 'Info'}
                  </span>
                )}
              </div>
              <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 text-[#969696] transition-transform ${terminalExpanded ? '' : 'rotate-180'}`}>
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
              </svg>
            </button>

            {terminalExpanded && (
              <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed min-h-0">
                {output !== null ? (
                  <>
                    <div className="mb-1">
                      <span className="text-green-500">❯ </span>
                      <span className="text-[#569cd6]">{language.id === 'python' ? 'python' : 'node'}</span>
                      <span className="text-white"> {loadedFileName || (language.id === 'python' ? 'script.py' : 'main.js')}</span>
                    </div>
                    <pre className={`whitespace-pre-wrap ${outputType === 'error' ? 'text-red-400' : 'text-[#d4d4d4]'}`}>{output}</pre>
                    <div className="mt-3">
                      <span className="text-green-500">❯ </span>
                      <span className="w-2 h-4 bg-[#969696] inline-block animate-pulse" />
                    </div>
                  </>
                ) : isRunning ? (
                  <div>
                    <span className="text-green-500">❯ </span>
                    <span className="text-[#569cd6]">{language.id === 'python' ? 'python' : 'node'}</span>
                    <span className="text-white"> {loadedFileName || (language.id === 'python' ? 'script.py' : 'main.js')}</span>
                    <span className="ml-2 text-[#969696] animate-pulse">executing...</span>
                  </div>
                ) : (
                  <div className="text-[#666] text-xs">
                    Press <kbd className="px-1.5 py-0.5 bg-[#2d2d2d] rounded border border-[#3c3c3c] text-[#969696] font-mono text-[10px]">Run</kbd> to execute your code
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── AI Feedback Panel ─── */}
          {feedback && (
            <div className="h-48 bg-[#1a2e1a] border-t border-[#2d5a2d] flex flex-col shrink-0">
              <div className="px-4 py-2 bg-[#1e3a1e] border-b border-[#2d5a2d] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="#4caf50" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <span className="text-[11px] uppercase font-bold text-green-400 tracking-wider">AI Feedback</span>
                </div>
                <button onClick={() => setFeedback(null)} className="text-green-600 hover:text-green-400 text-xs font-medium">Close</button>
              </div>
              <div className="flex-1 p-4 overflow-auto text-sm text-green-200 leading-relaxed whitespace-pre-wrap font-mono">
                {feedback}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Submit Modal ─── */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => !isSubmitting && setShowSubmitModal(false)}>
          <div className="bg-[#252526] border border-[#3c3c3c] rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#3c3c3c]">
              <h3 className="text-lg font-semibold text-white">Submit Your Work</h3>
              <p className="text-xs text-[#969696] mt-1">Save your code as a submission for this assignment</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Filename input */}
              <div>
                <label className="block text-xs text-[#969696] mb-2 font-medium">Filename</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={submitFilename}
                      onChange={(e) => setSubmitFilename(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg text-sm text-white font-mono outline-none focus:border-[#0e639c] disabled:opacity-50"
                      placeholder="my_solution.py"
                      autoFocus
                    />
                  </div>
                </div>
                <p className="text-[10px] text-[#666] mt-1.5">
                  Use {language.ext} extension for {language.label} files
                </p>
              </div>

              {/* Code preview */}
              <div>
                <label className="block text-xs text-[#969696] mb-2 font-medium">Code Preview</label>
                <pre className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg p-3 text-xs text-[#d4d4d4] font-mono max-h-32 overflow-auto">
                  {code.split('\n').slice(0, 8).join('\n')}{code.split('\n').length > 8 ? '\n...' : ''}
                </pre>
              </div>

              {/* Success message */}
              {submitSuccess && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-900/30 border border-green-800 rounded-lg">
                  <svg viewBox="0 0 24 24" fill="#4caf50" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <span className="text-xs text-green-400 font-medium">Submitted successfully!</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#3c3c3c] flex items-center justify-end gap-2">
              <button onClick={() => setShowSubmitModal(false)} disabled={isSubmitting}
                className="px-4 py-2 text-sm text-[#969696] hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting || !submitFilename.trim() || submitSuccess}
                className="flex items-center gap-2 px-5 py-2 bg-[#6a1b9a] hover:bg-[#7b1fa2] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {isSubmitting ? (
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 019.8 8" strokeLinecap="round"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                )}
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
