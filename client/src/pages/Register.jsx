import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Mail, Lock, User, Store, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { registerUser } from '../services/authApi'
import { useAuth } from '../context/AuthContext'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');`

const ROLES = [
  { id: 'buyer', label: 'Buyer', hint: 'Shop & message sellers' },
  { id: 'seller', label: 'Seller', hint: 'Open your own shop' },
]

export default function Register() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [role, setRole] = useState('buyer')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
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

    setLoading(true)
    try {
      const data = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
      })
      setSession(data)
      setSubmitted(true)
      navigate('/shop')
    } catch (err) {
      setError(err.message || 'Registration failed')
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
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#4A423A] cursor-pointer hover:text-[#5B2145] hover:-translate-y-0.5 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" /> Back home
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E7DFD0] rounded-md shadow-[0_20px_48px_-28px_rgba(43,25,12,0.4)] p-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#5B2145] mb-2">Account</p>
          <h1 className="font-['Fraunces'] text-3xl mb-1">Join Vendora</h1>
          <p className="text-sm text-[#8A7F6E] mb-6">
            Create an account as a buyer or open your shop as a seller.
          </p>

          {submitted ? (
            <div className="rounded-sm border border-[#E7DFD0] bg-[#FAF7F2] p-5 text-center">
              <p className="font-['Fraunces'] text-lg mb-2">Account ready</p>
              <p className="text-sm text-[#4A423A] mb-4">
                Auth is UI-only for now. Backend registration will connect here next.
              </p>
              <Link
                to="/"
                className="inline-block text-sm bg-[#5B2145] text-[#F4E9EE] px-4 py-2 rounded-sm cursor-pointer hover:bg-[#471735] hover:-translate-y-0.5 hover:scale-[1.03] transition-all duration-200"
              >
                Continue browsing
              </Link>
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
                      className={`text-left rounded-sm border px-3 py-2.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5B2145] ${
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
                <span className="text-xs font-mono uppercase tracking-widest text-[#8A7F6E] mb-1.5 block">Confirm password</span>
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
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}

          {!submitted && (
            <>
              <p className="mt-6 text-center text-sm text-[#8A7F6E]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#5B2145] font-medium cursor-pointer hover:underline">
                  Log in
                </Link>
              </p>
              <p className="mt-3 text-center text-sm text-[#8A7F6E]">
                Need admin access?{' '}
                <Link to="/admin/register" className="text-[#5B2145] font-medium cursor-pointer hover:underline">
                  Request an admin account
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
