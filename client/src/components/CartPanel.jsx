import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

export default function CartPanel({
  open,
  onClose,
  cart,
  cartSubtotal,
  onUpdateQuantity,
  onRemove,
  onClear,
  lineTotal,
}) {
  if (!open) return null

  return (
    <div className="absolute right-0 top-9 z-40 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] shadow-xl">
      <div className="flex items-center justify-between border-b border-[#D9CFBB] px-3 py-2.5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-[#5C3A4B]">Your bag</p>
          <p className="text-[11px] text-[#9A9284]">
            {cart.length === 0 ? 'Empty' : `${cart.length} item${cart.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close bag"
          className="rounded-sm p-1 text-[#9A9284] hover:bg-[#EEE7D8] hover:text-[#2B2620] cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <ShoppingBag size={22} className="mx-auto text-[#D9CFBB]" />
            <p className="mt-2 text-sm text-[#6E6455]">Your bag is empty</p>
            <p className="mt-1 text-[11px] text-[#9A9284]">Add something from the shop to get started.</p>
          </div>
        ) : (
          <ul>
            {cart.map((item) => (
              <li key={item.id} className="flex gap-2.5 border-b border-[#E7DFD0] px-3 py-3 last:border-b-0">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#E4DCC8]">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ShoppingBag size={14} className="text-[#9A9284]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#2B2620]">{item.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-[#6E7856]">{item.seller}</p>
                  <p className="mt-0.5 text-xs text-[#2B2620]">{formatMoney(lineTotal(item))}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="rounded-sm border border-[#D9CFBB] p-0.5 text-[#2B2620] hover:bg-[#EEE7D8] cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="min-w-5 text-center font-mono text-xs text-[#2B2620]">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="rounded-sm border border-[#D9CFBB] p-0.5 text-[#2B2620] hover:bg-[#EEE7D8] cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => onRemove(item.id)}
                      className="ml-auto rounded-sm p-1 text-[#5C3A4B] hover:bg-[#EEE7D8] cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-[#D9CFBB] px-3 py-3">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-[#6E6455]">Subtotal</span>
            <span className="font-medium text-[#2B2620]">{formatMoney(cartSubtotal)}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClear}
              className="rounded-sm border border-[#D9CFBB] px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-[#5C3A4B] hover:bg-[#EEE7D8] cursor-pointer"
            >
              Clear
            </button>
            <Link
              to="/cart"
              onClick={onClose}
              className="flex-1 rounded-sm bg-[#2B2620] px-3 py-2 text-center font-mono text-[10px] uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B]"
            >
              View bag
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
