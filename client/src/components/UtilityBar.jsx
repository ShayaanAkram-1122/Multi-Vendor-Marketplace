import { Link } from 'react-router-dom'

export default function UtilityBar() {
  return (
    <div className="border-b border-[#D9CFBB] bg-[#2B2620] text-[#EEE7D8]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em]">
          Free shipping on orders over $75 · Handmade, always
        </p>
        <div className="hidden items-center gap-4 sm:flex">
          <Link to="/shop" className="font-mono text-[10px] uppercase tracking-wide hover:text-[#D6A24A] transition-colors">
            Shop
          </Link>
          <Link to="/register" className="font-mono text-[10px] uppercase tracking-wide hover:text-[#D6A24A] transition-colors">
            Sell on Vendora
          </Link>
          <a href="mailto:hello@vendora.app" className="font-mono text-[10px] uppercase tracking-wide hover:text-[#D6A24A] transition-colors">
            Help
          </a>
        </div>
      </div>
    </div>
  )
}
