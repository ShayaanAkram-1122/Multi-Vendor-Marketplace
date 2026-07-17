import { X, Store, Package, HelpCircle, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const CATEGORIES = ['Home & Living', 'Jewelry', 'Art & Prints', 'Vintage', 'Wellness', 'Stationery']

export default function MobileMenu({ open, onClose, activeCategory, onSelectCategory, user }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 sm:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-[#2B2620]/40"
        aria-label="Close menu backdrop"
        onClick={onClose}
      />
      <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-[#FBF8F2] p-5 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-['Fraunces'] text-xl italic text-[#2B2620]">Vendora</span>
          <button type="button" onClick={onClose} aria-label="Close menu" className="cursor-pointer">
            <X size={20} className="text-[#2B2620]" />
          </button>
        </div>

        {user ? (
          <div className="mb-6 rounded-sm border border-[#D9CFBB] bg-[#EEE7D8]/50 px-3 py-3">
            <p className="text-sm font-medium text-[#2B2620]">{user.name}</p>
            {user.email && <p className="mt-0.5 text-[11px] text-[#9A9284] truncate">{user.email}</p>}
          </div>
        ) : (
          <div className="mb-6 flex gap-2">
            <Link
              to="/login"
              onClick={onClose}
              className="flex-1 rounded-sm bg-[#5C3A4B] py-2 text-center font-mono text-xs uppercase tracking-wide text-[#EEE7D8]"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={onClose}
              className="flex-1 rounded-sm border border-[#5C3A4B] py-2 text-center font-mono text-xs uppercase tracking-wide text-[#5C3A4B]"
            >
              Register
            </Link>
          </div>
        )}

        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[#9A9284]">Categories</p>
        <div className="mb-6 flex flex-col gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelectCategory(activeCategory === cat ? null : cat)
                onClose()
              }}
              className={`rounded-sm px-3 py-2 text-left text-sm cursor-pointer ${
                activeCategory === cat ? 'bg-[#6E7856] text-[#EEE7D8]' : 'text-[#2B2620] hover:bg-[#EEE7D8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-[#D9CFBB] pt-4 text-sm text-[#4A443A]">
          <Link to="/shop" onClick={onClose} className="flex items-center gap-2 py-1.5">
            <MapPin size={15} /> Delivery location
          </Link>
          <Link to="/register" onClick={onClose} className="flex items-center gap-2 py-1.5">
            <Store size={15} /> Sell on Vendora
          </Link>
          <Link to="/orders" onClick={onClose} className="flex items-center gap-2 py-1.5">
            <Package size={15} /> Track order
          </Link>
          <Link to="/help" onClick={onClose} className="flex items-center gap-2 py-1.5">
            <HelpCircle size={15} /> Help
          </Link>
        </div>
      </div>
    </div>
  )
}
