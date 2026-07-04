import { useState, useEffect } from 'react'
import { ShoppingBag, X, Mail, Lock, User, Store } from 'lucide-react'

const ROLES = [
  { id: 'buyer', label: 'Buyer', hint: 'Shop & message sellers' },
  { id: 'seller', label: 'Seller', hint: 'Open your own shop' },
]

export default function Register({ open, onClose, onSwitchToLogin }) {
  const [role, setRole] = useState('buyer')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setSubmitted(false)
    setRole('buyer')
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
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

    if (!form.name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.')
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
        aria-labelledby="register-title"
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
          <h2 id="register-title" className="font-['Fraunces'] text-2xl mb-1">Join Vendora</h2>
          <p className="text-sm text-[#8A7F6E] mb-5">
            Create an account as a buyer or open your shop as a seller.
          </p>

          {submitted ? (
            <div className="rounded-sm border border-[#E7DFD0] bg-[#FAF7F2] p-5 text-center">
              <p className="font-['Fraunces'] text-lg mb-2">Account ready</p>
              <p className="text-sm text-[#4A423A] mb-4">
                Auth is UI-only for now. Backend registration will connect here next.
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
                <span className="text-xs font-mono uppercase tracking-widest text-[#8A7F6E] mb-1.5 block">Full name</span>
                <span className="flex items-center gap-2 bg-white border border-[#E7DFD0] rounded-sm px-3 py-2.5 focus-within:border-[#5B2145] transition-colors">
                  <User className="w-4 h-4 text-[#8A7F6E] shrink-0" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={update('name')}
                    placeholder="Alex Rivera"
                    autoComplete="name"
                    className="flex-1 outline-none text-sm bg-transparent placeholder:text-[#8A7F6E]"
                  />
                </span>
              </label>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#8A7F6E] mb-1.5 block">I want to</span>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`text-left rounded-sm border px-3 py-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5B2145] ${
                        role === r.id
                          ? 'border-[#5B2145] bg-[#F1E4EA]'
                          : 'border-[#E7DFD0] bg-white hover:border-[#5B2145]/40'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-sm font-medium text-[#231F1C]">
                        {r.id === 'seller' ? <Store className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                        {r.label}
                      </span>
                      <span className="block text-[11px] text-[#8A7F6E] mt-0.5">{r.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

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
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    className="flex-1 outline-none text-sm bg-transparent placeholder:text-[#8A7F6E]"
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-xs font-mono uppercase tracking-widest text-[#8A7F6E] mb-1.5 block">Confirm password</span>
                <span className="flex items-center gap-2 bg-white border border-[#E7DFD0] rounded-sm px-3 py-2.5 focus-within:border-[#5B2145] transition-colors">
                  <Lock className="w-4 h-4 text-[#8A7F6E] shrink-0" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    placeholder="Repeat password"
                    autoComplete="new-password"
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
                Create account
              </button>
            </form>
          )}

          {!submitted && (
            <p className="mt-5 text-center text-sm text-[#8A7F6E]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#5B2145] font-medium hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
