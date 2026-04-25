import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'

const ClassroomIcon = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto text-[#2D3748] mb-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    <path d="M8 2v5l2-1.5L12 7V2" strokeWidth="2" fill="currentColor" />
  </svg>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await signIn(email, password)

    if (authError) {
      setError(authError)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.')
      return
    }
    setForgotLoading(true)
    setForgotError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setForgotSuccess(true)
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send reset email.')
    } finally {
      setForgotLoading(false)
    }
  }

  const closeForgotModal = () => {
    setShowForgotModal(false)
    setForgotEmail('')
    setForgotError('')
    setForgotSuccess(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="absolute top-6 right-6">
        <Link to="/signup">
          <button className="px-6 py-2 bg-[#1976D2] hover:bg-[#1565C0] text-white text-sm font-medium rounded-md transition-colors">
            Sign Up
          </button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[360px] text-center mb-8">
          <ClassroomIcon />
          <h1 className="text-xl font-bold text-[#202124] tracking-tight mb-1">Your AI classroom.</h1>
          <p className="text-lg font-medium text-[#80868B]">Log in to your classroom account</p>
        </div>

        <div className="w-full max-w-[360px] text-left">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="Enter your password..."
                className="w-full px-4 py-2.5 bg-white border border-[#1976D2] rounded-md text-sm text-gray-900 outline-none shadow-[0_0_0_1px_#1976D2_inset] placeholder:text-[#9AA0A6]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm font-semibold text-[#1976D2] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1976D2] hover:bg-[#1565C0] text-white text-sm font-medium rounded-md transition-colors mt-2 disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Continue'}
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

      {/* ─── Forgot Password Modal ─── */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeForgotModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#202124]">Reset your password</h2>
              <button onClick={closeForgotModal} className="text-[#9AA0A6] hover:text-[#5F6368] transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg viewBox="0 0 24 24" fill="#16a34a" className="w-6 h-6">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#202124] mb-1">Check your inbox</p>
                <p className="text-xs text-[#5F6368]">
                  A password reset link has been sent to <strong>{forgotEmail}</strong>.
                </p>
                <button
                  onClick={closeForgotModal}
                  className="mt-4 w-full py-2.5 bg-[#1976D2] text-white text-sm font-medium rounded-md hover:bg-[#1565C0] transition-colors"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#5F6368] mb-4">
                  Enter the email address linked to your account and we'll send you a reset link.
                </p>

                {forgotError && (
                  <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-600">{forgotError}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#5F6368] mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email address..."
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={forgotLoading}
                    onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
                    className="w-full px-4 py-2.5 bg-white border border-[#DADCE0] rounded-md text-sm text-gray-900 outline-none focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2] placeholder:text-[#9AA0A6] transition-all"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={closeForgotModal}
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 border border-[#DADCE0] text-[#5F6368] text-sm font-medium rounded-md hover:bg-[#F1F3F4] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleForgotPassword}
                    disabled={forgotLoading || !forgotEmail.trim()}
                    className="flex-1 py-2.5 bg-[#1976D2] text-white text-sm font-medium rounded-md hover:bg-[#1565C0] transition-colors disabled:opacity-70"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
