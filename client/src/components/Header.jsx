import { Heart, ShoppingBag, User } from 'lucide-react'
import { Link } from 'react-router-dom'

const CATEGORIES = ['Home & Living', 'Jewelry', 'Art & Prints', 'Vintage', 'Wellness', 'Stationery']

export default function Header({ activeCategory, onSelectCategory, cartCount = 0 }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#D9CFBB] bg-[#FBF8F2]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="font-['Fraunces'] text-2xl italic text-[#2B2620] hover:text-[#5C3A4B] transition-colors">
          Vendora
        </Link>

        <div className="flex items-center gap-5 text-[#2B2620]">
          <button type="button" aria-label="Wishlist" className="hover:text-[#5C3A4B] cursor-pointer">
            <Heart size={20} />
          </button>
          <button type="button" aria-label="Bag" className="relative hover:text-[#5C3A4B] cursor-pointer">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D6A24A] text-[9px] font-bold text-[#2B2620]">
                {cartCount}
              </span>
            )}
          </button>
          <Link to="/login" aria-label="Account" className="hover:text-[#5C3A4B] cursor-pointer">
            <User size={20} />
          </Link>
        </div>
      </div>

      <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(active ? null : cat)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors cursor-pointer ${
                active
                  ? 'border-[#6E7856] bg-[#6E7856] text-[#EEE7D8]'
                  : 'border-[#D9CFBB] bg-transparent text-[#4A443A] hover:border-[#6E7856] hover:text-[#6E7856]'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </nav>
    </header>
  )
}
