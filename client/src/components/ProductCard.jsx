import { Sparkles, Star, ShoppingBag, Heart } from 'lucide-react'
import { useShopActivity } from '../context/ShopActivityContext'

export default function ProductCard({ product, size = 'default' }) {
  const { name, seller, price, rating, image, aiPick, tilt } = product
  const width = size === 'compact' ? 'w-56' : 'w-full'
  const { isFavorite, toggleFavorite } = useShopActivity()
  const favorited = isFavorite(product.id)

  const handleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product)
  }

  return (
    <div className={`group relative ${width} shrink-0`}>
      <div
        className="absolute -top-3 -right-3 z-20 rotate-[10deg] transition-transform duration-300 group-hover:rotate-[16deg] group-hover:-translate-y-0.5"
        aria-hidden="true"
      >
        <svg width="72" height="40" viewBox="0 0 72 40" className="drop-shadow-sm">
          <path d="M4 20 L18 4 H68 V36 H18 Z" fill="#D6A24A" stroke="#5C3A4B" strokeWidth="1" />
          <circle cx="12" cy="20" r="3.5" fill="#EEE7D8" stroke="#5C3A4B" strokeWidth="1" />
          <line x1="0" y1="14" x2="10" y2="17" stroke="#2B2620" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-end pr-2 pt-1 font-mono text-[13px] font-semibold text-[#2B2620]">
          ${price}
        </span>
      </div>

      <div
        className={`relative overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] shadow-[0_2px_6px_rgba(43,38,32,0.08)] transition-all duration-300 ${tilt || ''} group-hover:rotate-0 group-hover:shadow-[0_10px_24px_rgba(43,38,32,0.16)] group-hover:-translate-y-1`}
      >
        {aiPick && (
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-[#5C3A4B] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#EEE7D8]">
            <Sparkles size={11} />
            AI Pick
          </div>
        )}

        <div className="aspect-square overflow-hidden bg-[#E4DCC8]">
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#9A9284]">
              <ShoppingBag size={28} />
            </div>
          )}
        </div>

        <div className="space-y-1 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#6E7856]">{seller}</p>
          <h3 className="font-['Fraunces'] text-[15px] leading-snug text-[#2B2620] line-clamp-2">{name}</h3>
          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1 text-xs text-[#6E7856]">
              <Star size={12} fill="#D6A24A" stroke="#D6A24A" />
              {rating}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleFavorite}
                aria-label={favorited ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
                aria-pressed={favorited}
                className={`rounded-full border p-1.5 transition-colors cursor-pointer ${
                  favorited
                    ? 'border-[#5C3A4B] bg-[#5C3A4B] text-[#EEE7D8]'
                    : 'border-[#D9CFBB] bg-transparent text-[#5C3A4B] hover:border-[#5C3A4B]'
                }`}
              >
                <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                aria-label={`Add ${name} to bag`}
                className="rounded-full bg-[#2B2620] p-1.5 text-[#EEE7D8] opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-[#5C3A4B] cursor-pointer"
              >
                <ShoppingBag size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
