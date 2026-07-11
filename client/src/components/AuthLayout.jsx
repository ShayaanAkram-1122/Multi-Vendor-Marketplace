import { ShieldCheck, BarChart3, Users, Flag, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

const FEATURES = [
  { icon: BarChart3, text: 'Platform-wide analytics and revenue tracking' },
  { icon: Users, text: 'Manage sellers, buyers, and role permissions' },
  { icon: Flag, text: 'Moderate listings, reviews, and reported content' },
]

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');`

export default function AuthLayout({ children }) {
  return (
    <div
      className="grid min-h-screen grid-cols-1 bg-[#F3EEE1] lg:grid-cols-2"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONT_IMPORT}</style>

      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#2B2620] p-10 text-[#EEE7D8] lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #EEE7D8 1px, transparent 1px), radial-gradient(circle at 60% 70%, #EEE7D8 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 text-[#EEE7D8] hover:text-[#D6A24A] transition-colors">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#5C3A4B]">
              <ShoppingBag size={16} />
            </span>
            <span className="font-['Fraunces'] text-2xl italic">Vendora</span>
          </Link>
          <div className="mt-2 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#D6A24A]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D6A24A]">
              Admin Console
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="max-w-sm font-['Fraunces'] text-3xl italic leading-snug text-[#EEE7D8]">
            Everything that keeps the marketplace running, in one place.
          </h2>
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-[#D9CFBB]">
                <span className="mt-0.5 rounded-sm bg-[#3A342B] p-1.5">
                  <Icon size={15} className="text-[#D6A24A]" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 font-mono text-[11px] text-[#9A9284]">
          Restricted access — admin credentials only.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
