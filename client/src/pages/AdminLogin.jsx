import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { adminLogin } from '../lib/adminAuth'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const session = await adminLogin(form)
      setSession(session)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Login failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <span className="mb-1 inline-block rounded-full bg-[#D6A24A]/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#5C3A4B]">
        Admin Access
      </span>
      <h1 className="mt-2 font-['Fraunces'] text-2xl text-[#2B2620]">Sign in to your console</h1>
      <p className="mt-1 text-sm text-[#6E6455]">Enter your admin credentials to continue.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-[#6E6455]">
            Email
          </label>
          <div className="flex items-center gap-2 rounded-sm border border-[#D9CFBB] bg-white px-3 py-2.5 focus-within:border-[#5C3A4B]">
            <Mail size={16} className="text-[#9A9284]" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@vendora.com"
              className="w-full bg-transparent text-sm text-[#2B2620] outline-none"
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="font-mono text-[11px] uppercase tracking-wide text-[#6E6455]">
              Password
            </label>
            <Link to="/forgot-password" className="font-mono text-[11px] text-[#5C3A4B] hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-[#D9CFBB] bg-white px-3 py-2.5 focus-within:border-[#5C3A4B]">
            <Lock size={16} className="text-[#9A9284]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm text-[#2B2620] outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Toggle password visibility"
              className="cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} className="text-[#9A9284]" /> : <Eye size={16} className="text-[#9A9284]" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-sm bg-[#5C3A4B]/10 px-3 py-2 text-sm text-[#5C3A4B]">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-sm bg-[#2B2620] py-2.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] transition-colors hover:bg-[#5C3A4B] disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6E6455]">
        Need admin access?{' '}
        <Link to="/admin/register" className="font-medium text-[#5C3A4B] hover:underline">
          Request an account
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-[#9A9284]">
        Shopping instead?{' '}
        <Link to="/login" className="font-medium text-[#5C3A4B] hover:underline">
          Buyer / seller login
        </Link>
      </p>
    </AuthLayout>
  )
}
