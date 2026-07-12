import { Heart, X } from 'lucide-react'

export default function FavoritesPanel({ open, onClose, favorites, onRemove }) {
  if (!open) return null

  return (
    <div className="absolute right-0 top-9 z-40 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] shadow-xl">
      <div className="flex items-center justify-between border-b border-[#D9CFBB] px-3 py-2.5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-[#5C3A4B]">Favourites</p>
          <p className="text-[11px] text-[#9A9284]">
            {favorites.length === 0 ? 'None saved yet' : `${favorites.length} saved`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close favourites"
          className="rounded-sm p-1 text-[#9A9284] hover:bg-[#EEE7D8] hover:text-[#2B2620] cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {favorites.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Heart size={22} className="mx-auto text-[#D9CFBB]" />
            <p className="mt-2 text-sm text-[#6E6455]">No favourites yet</p>
            <p className="mt-1 text-[11px] text-[#9A9284]">Tap the heart on any product to save it.</p>
          </div>
        ) : (
          <ul>
            {favorites.map((item) => (
              <li key={item.id} className="flex gap-2.5 border-b border-[#E7DFD0] px-3 py-2.5 last:border-b-0">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#E4DCC8]">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Heart size={14} className="text-[#9A9284]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#2B2620]">{item.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-[#6E7856]">{item.seller}</p>
                  <p className="mt-0.5 text-xs text-[#2B2620]">${item.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="self-start rounded-full p-1 text-[#5C3A4B] hover:bg-[#EEE7D8] cursor-pointer"
                >
                  <Heart size={14} fill="currentColor" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
