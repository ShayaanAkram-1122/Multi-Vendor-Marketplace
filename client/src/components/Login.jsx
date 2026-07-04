import { useState, useEffect } from 'react'
import { ShoppingBag, X, Mail, Lock } from 'lucide-react'

export default function Login({ open, onClose, onSwitchToRegister }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setSubmitted(false)
    setForm({ email: '', password: '' })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.')
      return
    }

    // UI-only for now — backend auth will plug in here
    setSubmitted(true)
  }

  return (
    <div
      className="story-backdrop fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-[#231F1C]/55 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="story-modal relative w-full max-w-md bg-[#FFFDF9] border border-[#E7DFD0] rounded-md shadow-[0_28px_60px_-24px_rgba(43,25,12,0.55)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-[#5B2145] flex items-center justify-center text-[#F4E9EE]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="font-['Fraunces'] font-semibold text-lg tracking-tight">Vendora</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-sm flex items-center justify-center text-[#8A7F6E] hover:text-[#231F1C] hover:bg-[#F1E4EA] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5B2145]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-7">
          <h2 id="login-title" className="font-['Fraunces'] text-2xl mb-1">Welcome back</h2>
          <p className="text-sm text-[#8A7F6E] mb-5">
            Sign in to shop, message sellers, or manage your stall.
          </p>

          {submitted ? (
            <div className="rounded-sm border border-[#E7DFD0] bg-[#FAF7F2] p-5 text-center">
              <p className="font-['Fraunces'] text-lg mb-2">You&apos;re signed in</p>
              <p className="text-sm text-[#4A423A] mb-4">
                Auth is UI-only for now. Backend login will connect here next.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="text-sm bg-[#5B2145] text-[#F4E9EE] px-4 py-2 rounded-sm hover:bg-[#471735] transition-colors"
              >
                Continue browsing
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <label className="block">
                <span className="text-xs font-mono uppercase tracking-widest text-[#8A7F6E] mb-1.5 block">Email</span>
                <span className="flex items-center gap-2 bg-white border border-[#E7DFD0] rounded-sm px-3 py-2.5 focus-within:border-[#5B2145] transition-colors">
                  <Mail className="w-4 h-4 text-[#8A7F6E] shrink-0" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@email.com"
                    autoComplete="email"
                    required
                    className="flex-1 outline-none text-sm bg-transparent placeholder:text-[#8A7F6E]"
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-xs font-mono uppercase tracking-widest text-[#8A7F6E] mb-1.5 block">Password</span>
                <span className="flex items-center gap-2 bg-white border border-[#E7DFD0] rounded-sm px-3 py-2.5 focus-within:border-[#5B2145] transition-colors">
                  <Lock className="w-4 h-4 text-[#8A7F6E] shrink-0" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Your password"
                    autoComplete="current-password"
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
                className="w-full text-sm bg-[#5B2145] text-[#F4E9EE] font-medium py-2.5 rounded-sm hover:bg-[#471735] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B2145]"
              >
                Log in
              </button>
            </form>
          )}

          {!submitted && (
            <p className="mt-5 text-center text-sm text-[#8A7F6E]">
              New here?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[#5B2145] font-medium hover:underline"
              >
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
