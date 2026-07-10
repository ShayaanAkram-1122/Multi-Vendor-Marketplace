import { X } from 'lucide-react'
import { Link } from 'react-router-dom'

const CATEGORIES = ['Home & Living', 'Jewelry', 'Art & Prints', 'Vintage', 'Wellness', 'Stationery']

export default function MobileMenu({
  open,
  onClose,
  activeCategory,
  onSelectCategory,
  user = null,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-[#2B2620]/45"
        aria-label="Close menu backdrop"
        onClick={onClose}
      />
      <div className="absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col bg-[#FBF8F2] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#D9CFBB] px-4 py-4">
          <span className="font-['Fraunces'] text-xl italic text-[#2B2620]">Vendora</span>
          <button type="button" onClick={onClose} aria-label="Close menu" className="cursor-pointer text-[#2B2620]">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#9A9284]">Categories</p>
          <div className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onSelectCategory?.(active ? null : cat)
                    onClose?.()
                  }}
                  className={`rounded-sm px-3 py-2.5 text-left font-mono text-xs uppercase tracking-wide cursor-pointer ${
                    active
                      ? 'bg-[#6E7856] text-[#EEE7D8]'
                      : 'text-[#2B2620] hover:bg-[#EEE7D8]'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          <div className="mt-6 border-t border-[#D9CFBB] pt-4">
            {user ? (
              <div className="space-y-1">
                <p className="mb-2 px-3 font-['Fraunces'] text-sm text-[#2B2620]">Hi, {user.name}</p>
                <Link to="/account" onClick={onClose} className="block rounded-sm px-3 py-2 text-sm text-[#2B2620] hover:bg-[#EEE7D8]">My Account</Link>
                <Link to="/orders" onClick={onClose} className="block rounded-sm px-3 py-2 text-sm text-[#2B2620] hover:bg-[#EEE7D8]">My Orders</Link>
                <Link to="/login" onClick={onClose} className="block rounded-sm px-3 py-2 text-sm text-[#5C3A4B] hover:bg-[#EEE7D8]">Sign Out</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-1">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="rounded-sm border border-[#D9CFBB] px-3 py-2 text-center font-mono text-xs uppercase tracking-wide text-[#2B2620]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="rounded-sm bg-[#5C3A4B] px-3 py-2 text-center font-mono text-xs uppercase tracking-wide text-[#EEE7D8]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
