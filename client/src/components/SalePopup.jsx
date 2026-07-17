import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Percent, X, Tag } from 'lucide-react'
import { getAccessToken } from '../services/authApi'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function saleFingerprint(products) {
  return products
    .map((p) => `${p.id}:${p.discountPercent}`)
    .sort()
    .join('|')
}

function salePrice(product) {
  const discount = Number(product.discountPercent) || 0
  const price = Number(product.price) || 0
  if (discount <= 0) return price
  return Math.round(price * (1 - discount / 100) * 100) / 100
}

export default function SalePopup({ user }) {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState([])

  useEffect(() => {
    if (!user?.email || user.role === 'admin') return undefined

    let cancelled = false
    const token = getAccessToken()
    if (!token) return undefined

    ;(async () => {
      try {
        const res = await fetch(`${API_URL}/sales/popup`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json().catch(() => ({}))
        if (cancelled || !res.ok || !data.showPopup || !data.products?.length) return

        const key = `vendora_sale_popup_${user.id || user.email}`
        const fingerprint = saleFingerprint(data.products)
        const seen = localStorage.getItem(key)
        if (seen === fingerprint) return

        setProducts(data.products)
        setOpen(true)
      } catch {
        // ignore popup failures
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user])

  const dismiss = () => {
    if (user && products.length) {
      const key = `vendora_sale_popup_${user.id || user.email}`
      localStorage.setItem(key, saleFingerprint(products))
    }
    setOpen(false)
  }

  if (!open || !products.length) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#2B2620]/50"
        aria-label="Close sale popup"
        onClick={dismiss}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#D9CFBB] bg-[#5C3A4B] px-4 py-4 text-[#EEE7D8]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#D6A24A]">Limited deals</p>
            <h2 className="font-['Fraunces'] text-2xl italic">Items are on sale</h2>
            <p className="mt-1 text-sm text-[#D9CFBB]">
              These products have discounts right now. Subscribe on the homepage if you want sale alerts by email.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="rounded-sm p-1 hover:bg-[#4A2F3C] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <ul className="max-h-[50vh] divide-y divide-[#E7DFD0] overflow-y-auto">
          {products.map((product) => {
            const discounted = salePrice(product)
            return (
              <li key={product.id} className="flex items-center gap-3 px-4 py-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-[#E7DFD0] bg-[#EEE7D8]">
                  {product.image ? (
                    <img src={product.image} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#2B2620]">{product.name}</p>
                  <p className="text-[11px] text-[#9A9284]">{product.seller}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-[#5C3A4B]">
                      ${discounted.toFixed(2)}
                    </span>
                    <span className="font-mono text-[11px] text-[#9A9284] line-through">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[#D6A24A]/25 px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#7A5A1A]">
                      <Percent size={10} />
                      {product.discountPercent}% off
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="flex flex-wrap gap-2 border-t border-[#D9CFBB] bg-white px-4 py-3">
          <Link
            to="/shop"
            onClick={dismiss}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-[#2B2620] px-3 py-2.5 font-mono text-[11px] uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B]"
          >
            <Tag size={13} /> Shop sales
          </Link>
          <Link
            to="/#newsletter"
            onClick={dismiss}
            className="inline-flex flex-1 items-center justify-center rounded-sm border border-[#D9CFBB] px-3 py-2.5 font-mono text-[11px] uppercase tracking-wide text-[#2B2620] hover:border-[#5C3A4B]"
          >
            Get email alerts
          </Link>
        </div>
      </div>
    </div>
  )
}
