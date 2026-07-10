import { MapPin, Store, Package, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function UtilityBar({ location = 'Set delivery location' }) {
  return (
    <div className="hidden bg-[#2B2620] text-[#D9CFBB] sm:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs sm:px-6">
        <button type="button" className="flex items-center gap-1.5 hover:text-[#EEE7D8] cursor-pointer">
          <MapPin size={13} />
          {location}
        </button>

        <div className="flex items-center gap-5">
          <Link to="/register" className="flex items-center gap-1.5 hover:text-[#EEE7D8]">
            <Store size={13} />
            Sell on Vendora
          </Link>
          <Link to="/orders" className="flex items-center gap-1.5 hover:text-[#EEE7D8]">
            <Package size={13} />
            Track Order
          </Link>
          <a href="mailto:hello@vendora.app" className="flex items-center gap-1.5 hover:text-[#EEE7D8]">
            <HelpCircle size={13} />
            Help
          </a>
        </div>
      </div>
    </div>
  )
}
