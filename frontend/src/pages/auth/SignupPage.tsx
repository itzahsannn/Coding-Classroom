import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const ClassroomIcon = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto text-[#2D3748] mb-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    <path d="M8 2v5l2-1.5L12 7V2" strokeWidth="2" fill="currentColor" />
  </svg>
)

export default function SignupPage() {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'student' | 'instructor'>('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Email confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setError('')
    setLoading(true)

    const { error: authError } = await signUp(email, password, name, role)

    if (authError) {
      setError(authError)
      setLoading(false)
    } else {
      // Show the email confirmation popup instead of navigating
      setLoading(false)
      setShowConfirmModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="absolute top-6 right-6">
        <Link to="/login">
          <button className="px-6 py-2 bg-[#1976D2] hover:bg-[#1565C0] text-white text-sm font-medium rounded-md transition-colors">
            Log In
          </button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[360px] text-center mb-8">
          <ClassroomIcon />
          <h1 className="text-xl font-bold text-[#202124] tracking-tight mb-1">Your AI classroom.</h1>
          <p className="text-lg font-medium text-[#80868B]">Sign up for your classroom account</p>
        </div>

        <div className="w-full max-w-[360px] text-left">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#5F6368] mb-1.5 ml-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name..."
                className="w-full px-4 py-2.5 bg-white border border-[#1976D2] rounded-md text-sm text-gray-900 outline-none shadow-[0_0_0_1px_#1976D2_inset] placeholder:text-[#9AA0A6]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5F6368] mb-1.5 ml-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email address..."
                className="w-full px-4 py-2.5 bg-white border border-[#1976D2] rounded-md text-sm text-gray-900 outline-none shadow-[0_0_0_1px_#1976D2_inset] placeholder:text-[#9AA0A6]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-[#5F6368] mb-1.5 ml-1">Password</label>
              <input
                type="password"
                placeholder="Create a password..."
                className="w-full px-4 py-2.5 bg-white border border-[#1976D2] rounded-md text-sm text-gray-900 outline-none shadow-[0_0_0_1px_#1976D2_inset] placeholder:text-[#9AA0A6]"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5F6368] mb-1.5 ml-1">Re-enter Password</label>
              <input
                type="password"
                placeholder="Re-enter your password..."
                className="w-full px-4 py-2.5 bg-white border border-[#1976D2] rounded-md text-sm text-gray-900 outline-none shadow-[0_0_0_1px_#1976D2_inset] placeholder:text-[#9AA0A6]"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                disabled={loading}
                required
              />
            </div>

            {/* Role Toggle */}
            <div>
              <label className="block text-xs font-medium text-[#5F6368] mb-2 ml-1">I am a</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  disabled={loading}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all border ${
                    role === 'student'
                      ? 'bg-[#1976D2] text-white border-[#1976D2] shadow-sm'
                      : 'bg-white text-[#5F6368] border-[#DADCE0] hover:bg-[#F1F3F4]'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  disabled={loading}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all border ${
                    role === 'instructor'
                      ? 'bg-[#1976D2] text-white border-[#1976D2] shadow-sm'
                      : 'bg-white text-[#5F6368] border-[#DADCE0] hover:bg-[#F1F3F4]'
                  }`}
                >
                  Instructor
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1976D2] hover:bg-[#1565C0] text-white text-sm font-medium rounded-md transition-colors mt-6 disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-[11px] text-[#80868B] mt-5 px-4 leading-relaxed">
            By continuing, you acknowledge that you understand and agree to the Terms &amp; Conditions and Privacy Policy
          </p>
        </div>
      </div>

      <div className="py-6 flex justify-center items-center gap-1.5 text-[#5F6368] text-xs">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>Language: English (US) </span>
        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 ml-1" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* ─── Email Confirmation Modal ─── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
            {/* Email icon */}
            <div className="w-16 h-16 bg-[#E8F0FE] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="#1976D2" className="w-8 h-8">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>

            <h2 className="text-lg font-bold text-[#202124] mb-2">Confirm your Email</h2>
            <p className="text-sm text-[#5F6368] leading-relaxed mb-1">
              We've sent a confirmation link to
            </p>
            <p className="text-sm font-semibold text-[#1976D2] mb-4 break-all">{email}</p>
            <p className="text-xs text-[#80868B] leading-relaxed mb-6">
              Please check your inbox (and spam folder) and click the link to activate your account before logging in.
            </p>

            <Link to="/login">
              <button className="w-full py-2.5 bg-[#1976D2] hover:bg-[#1565C0] text-white text-sm font-medium rounded-md transition-colors">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
