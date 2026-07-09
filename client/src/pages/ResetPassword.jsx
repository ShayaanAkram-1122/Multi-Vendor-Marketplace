import { useState } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { ShoppingBag, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '../services/authApi'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');`

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const token = searchParams.get('token') || ''

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const email = location.state?.email

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Reset link is invalid. Please request a new one.')
      return
    }

    if (!form.password || !form.confirmPassword) {
      setError('Please enter and confirm your new password.')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await resetPassword({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Could not reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#231F1C] flex flex-col items-center justify-center px-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E7DFD0] rounded-md p-8 text-center">
          <p className="font-['Fraunces'] text-xl mb-3">Invalid reset link</p>
          <p className="text-sm text-[#8A7F6E] mb-6">This link is missing or expired. Request a new password reset.</p>
          <Link to="/forgot-password" className="text-sm bg-[#5B2145] text-[#F4E9EE] px-4 py-2 rounded-sm cursor-pointer hover:bg-[#471735] transition-colors">
            Forgot password
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231F1C] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      <header className="border-b border-[#E7DFD0] bg-[#FAF7F2]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 transition-transform duration-200">
            <div className="w-7 h-7 rounded-sm bg-[#5B2145] flex items-center justify-center text-[#F4E9EE]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="font-['Fraunces'] font-semibold text-lg tracking-tight">Vendora</span>
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-[#4A423A] cursor-pointer hover:text-[#5B2145] hover:-translate-y-0.5 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E7DFD0] rounded-md shadow-[0_20px_48px_-28px_rgba(43,25,12,0.4)] p-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#5B2145] mb-2">Account</p>
          <h1 className="font-['Fraunces'] text-3xl mb-1">Set new password</h1>
          <p className="text-sm text-[#8A7F6E] mb-6">
            {email
              ? <>Choose a new password for <strong className="text-[#4A423A]">{email}</strong>.</>
              : 'Choose a new password for your account.'}
          </p>

          {submitted ? (
            <div className="rounded-sm border border-[#E7DFD0] bg-[#FAF7F2] p-5 text-center">
              <p className="font-['Fraunces'] text-lg mb-2">Password updated</p>
              <p className="text-sm text-[#4A423A] mb-4">You can now sign in with your new password.</p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm bg-[#5B2145] text-[#F4E9EE] px-4 py-2 rounded-sm cursor-pointer hover:bg-[#471735] hover:-translate-y-0.5 hover:scale-[1.03] transition-all duration-200"
              >
                Go to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <label className="block">
                <span className="text-xs font-mono uppercase tracking-widest text-[#8A7F6E] mb-1.5 block">New password</span>
                <span className="flex items-center gap-2 bg-white border border-[#E7DFD0] rounded-sm px-3 py-2.5 focus-within:border-[#5B2145] transition-colors">
                  <Lock className="w-4 h-4 text-[#8A7F6E] shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    className="flex-1 outline-none text-sm bg-transparent placeholder:text-[#8A7F6E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-[#8A7F6E] hover:text-[#5B2145] cursor-pointer transition-colors shrink-0"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </span>
              </label>

              <label className="block">
                <span className="text-xs font-mono uppercase tracking-widest text-[#8A7F6E] mb-1.5 block">Confirm new password</span>
                <span className="flex items-center gap-2 bg-white border border-[#E7DFD0] rounded-sm px-3 py-2.5 focus-within:border-[#5B2145] transition-colors">
                  <Lock className="w-4 h-4 text-[#8A7F6E] shrink-0" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                    className="flex-1 outline-none text-sm bg-transparent placeholder:text-[#8A7F6E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="text-[#8A7F6E] hover:text-[#5B2145] cursor-pointer transition-colors shrink-0"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </span>
              </label>

              {error && (
                <p className="text-xs text-[#8B2E2E] bg-[#F8EAEA] border border-[#E8C8C8] rounded-sm px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full text-sm bg-[#5B2145] text-[#F4E9EE] font-medium py-2.5 rounded-sm cursor-pointer hover:bg-[#471735] hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B2145] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100"
              >
                {loading ? 'Updating password…' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
