import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { forgotPassword } from '../services/authApi'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');`

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    try {
      const data = await forgotPassword({ email: email.trim() })
      setSentTo(data.email || email.trim())
    } catch (err) {
      setError(err.message || 'Could not find an account with that email')
    } finally {
      setLoading(false)
    }
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
          <h1 className="font-['Fraunces'] text-3xl mb-1">Forgot password</h1>
          <p className="text-sm text-[#8A7F6E] mb-6">
            Enter the email you registered with. We&apos;ll send you a link to set a new password.
          </p>

          {sentTo ? (
            <div className="rounded-sm border border-[#E7DFD0] bg-[#FAF7F2] p-5 text-center">
              <CheckCircle2 className="mx-auto mb-3 text-[#6E7856]" size={36} />
              <p className="font-['Fraunces'] text-lg mb-2">Check your email</p>
              <p className="text-sm text-[#4A423A] mb-4">
                We sent a password reset link to <strong>{sentTo}</strong>. Open it to choose a new password.
              </p>
              <p className="text-xs text-[#8A7F6E] mb-4">
                Don&apos;t see it? Check spam, or try again in a minute.
              </p>
              <Link
                to="/login"
                className="inline-block text-sm bg-[#5B2145] text-[#F4E9EE] px-4 py-2 rounded-sm cursor-pointer hover:bg-[#471735] transition-colors"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <label className="block">
                <span className="text-xs font-mono uppercase tracking-widest text-[#8A7F6E] mb-1.5 block">Email</span>
                <span className="flex items-center gap-2 bg-white border border-[#E7DFD0] rounded-sm px-3 py-2.5 focus-within:border-[#5B2145] transition-colors">
                  <Mail className="w-4 h-4 text-[#8A7F6E] shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    placeholder="you@email.com"
                    autoComplete="email"
                    required
                    className="flex-1 outline-none text-sm bg-transparent placeholder:text-[#8A7F6E]"
                  />
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
                {loading ? 'Sending link…' : 'Send reset link'}
              </button>
            </form>
          )}

          {!sentTo && (
            <p className="mt-6 text-center text-sm text-[#8A7F6E]">
              Remember your password?{' '}
              <Link to="/login" className="text-[#5B2145] font-medium cursor-pointer hover:underline">
                Log in
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
