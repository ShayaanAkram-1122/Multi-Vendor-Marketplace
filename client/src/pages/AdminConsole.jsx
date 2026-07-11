import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, ShoppingBag, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { logoutUser } from '../services/authApi'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');`

export default function AdminConsole() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await logoutUser()
    } catch {
      // ignore
    }
    logout()
    navigate('/admin/login')
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3EEE1] px-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <div className="max-w-sm text-center">
          <ShieldCheck className="mx-auto text-[#5C3A4B]" size={36} />
          <h1 className="mt-4 font-['Fraunces'] text-2xl text-[#2B2620]">Admin access required</h1>
          <p className="mt-2 text-sm text-[#6E6455]">Sign in with an admin account to open the console.</p>
          <Link
            to="/admin/login"
            className="mt-6 inline-block rounded-sm bg-[#2B2620] px-6 py-2.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B]"
          >
            Admin Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3EEE1]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <header className="border-b border-[#D9CFBB] bg-[#FBF8F2]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#5C3A4B] text-[#EEE7D8]">
              <ShoppingBag size={16} />
            </span>
            <div>
              <p className="font-['Fraunces'] text-xl italic text-[#2B2620]">Vendora</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#D6A24A]">Admin Console</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-[#2B2620]">{user.name}</p>
              <p className="text-[11px] text-[#9A9284]">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#D9CFBB] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#5C3A4B] hover:bg-[#EEE7D8] cursor-pointer"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-['Fraunces'] text-3xl text-[#2B2620]">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="mt-2 text-sm text-[#6E6455]">
          Your admin console is ready. Analytics, seller tools, and moderation land here next.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {['Analytics', 'Users & roles', 'Moderation'].map((label) => (
            <div key={label} className="rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] px-4 py-5">
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#9A9284]">Coming soon</p>
              <p className="mt-1 font-['Fraunces'] text-lg text-[#2B2620]">{label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
