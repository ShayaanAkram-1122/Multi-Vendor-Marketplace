import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { adminRegister } from '../lib/adminAuth'

export default function AdminRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', inviteCode: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError("Passwords don't match.")
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    try {
      await adminRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        inviteCode: form.inviteCode.trim(),
      })
      setDone(true)
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center py-10 text-center">
          <CheckCircle2 size={40} className="text-[#6E7856]" />
          <h1 className="mt-4 font-['Fraunces'] text-2xl text-[#2B2620]">Account created</h1>
          <p className="mt-2 text-sm text-[#6E6455]">
            Your admin account is ready. You can sign in now.
          </p>
          <Link
            to="/admin/login"
            className="mt-6 rounded-sm bg-[#2B2620] px-6 py-2.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B]"
          >
            Go to Sign In
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <span className="mb-1 inline-block rounded-full bg-[#D6A24A]/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#5C3A4B]">
        Admin Access
      </span>
      <h1 className="mt-2 font-['Fraunces'] text-2xl text-[#2B2620]">Request an admin account</h1>
      <p className="mt-1 text-sm text-[#6E6455]">Requires a valid invite code from an existing admin.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field icon={User} label="Full name">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jordan Ahmed"
            className="w-full bg-transparent text-sm text-[#2B2620] outline-none"
          />
        </Field>

        <Field icon={Mail} label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@vendora.com"
            className="w-full bg-transparent text-sm text-[#2B2620] outline-none"
          />
        </Field>

        <Field icon={Lock} label="Password">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
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
        </Field>

        <Field icon={Lock} label="Confirm password">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="Re-enter password"
            className="w-full bg-transparent text-sm text-[#2B2620] outline-none"
          />
        </Field>

        <Field icon={KeyRound} label="Invite code">
          <input
            type="text"
            required
            value={form.inviteCode}
            onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
            placeholder="Provided by your team lead"
            className="w-full bg-transparent text-sm text-[#2B2620] outline-none"
          />
        </Field>

        {error && (
          <p className="rounded-sm bg-[#5C3A4B]/10 px-3 py-2 text-sm text-[#5C3A4B]">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-sm bg-[#2B2620] py-2.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] transition-colors hover:bg-[#5C3A4B] disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Creating account...' : 'Create Admin Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6E6455]">
        Already have an account?{' '}
        <Link to="/admin/login" className="font-medium text-[#5C3A4B] hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-[#9A9284]">
        Not an admin?{' '}
        <Link to="/register" className="font-medium text-[#5C3A4B] hover:underline">
          Create a buyer or seller account
        </Link>
      </p>
    </AuthLayout>
  )
}

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-[#6E6455]">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-sm border border-[#D9CFBB] bg-white px-3 py-2.5 focus-within:border-[#5C3A4B]">
        <Icon size={16} className="shrink-0 text-[#9A9284]" />
        {children}
      </div>
    </div>
  )
}
