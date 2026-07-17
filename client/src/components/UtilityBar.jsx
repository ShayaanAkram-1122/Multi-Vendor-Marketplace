import { MapPin, Store, Package, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useShopActivity } from '../context/ShopActivityContext'

export default function UtilityBar() {
  const { deliveryLabel } = useShopActivity()

  return (
    <div className="hidden bg-[#2B2620] text-[#D9CFBB] sm:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs sm:px-6">
        <Link
          to="/delivery-location"
          className="flex max-w-[50%] items-center gap-1.5 truncate hover:text-[#EEE7D8]"
          title={deliveryLabel}
        >
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">{deliveryLabel}</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link to="/register" className="flex items-center gap-1.5 hover:text-[#EEE7D8]">
            <Store size={13} />
            Sell on Vendora
          </Link>
          <Link to="/orders" className="flex items-center gap-1.5 hover:text-[#EEE7D8]">
            <Package size={13} />
            Track Order
          </Link>
          <Link to="/help" className="flex items-center gap-1.5 hover:text-[#EEE7D8]">
            <HelpCircle size={13} />
            Help
          </Link>
        </div>
      </div>
    </div>
  )
}
