import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5 mx-auto mb-1">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
)

const ClassroomIcon = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto text-[#2D3748] mb-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    <path d="M8 2v5l2-1.5L12 7V2" strokeWidth="2" fill="currentColor" />
  </svg>
)

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    // No backend yet, just navigate to dashboard
    navigate('/dashboard')
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

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#5F6368] mb-1.5 ml-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email address..."
                className="w-full px-4 py-2.5 bg-white border border-[#1976D2] rounded-md text-sm text-gray-900 outline-none shadow-[0_0_0_1px_#1976D2_inset] placeholder:text-[#9AA0A6]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
              />
              {error && <p className="text-xs text-red-600 mt-1 ml-1">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1976D2] hover:bg-[#1565C0] text-white text-sm font-medium rounded-md transition-colors mt-6"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-[11px] text-[#80868B] mt-5 px-4 leading-relaxed">
            By continuing, you acknowledge that you understand and agree to the Terms & Conditions and Privacy Policy
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
    </div>
  )
}
