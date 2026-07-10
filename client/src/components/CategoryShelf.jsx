import { ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

export default function CategoryShelf({ title, subtitle, products, onSeeAll }) {
  if (!products?.length) return null

  return (
    <section className="py-8">
      <div className="mb-4 flex items-end justify-between px-4 sm:px-6 mx-auto max-w-6xl">
        <div>
          <span className="inline-block rounded-full bg-[#6E7856] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#EEE7D8]">
            {title}
          </span>
          {subtitle && <p className="mt-2 font-['Fraunces'] text-lg text-[#2B2620]">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onSeeAll}
          className="flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-[#5C3A4B] hover:underline cursor-pointer"
        >
          See all <ChevronRight size={14} />
        </button>
      </div>

      <div className="mx-auto max-w-6xl flex gap-5 overflow-x-auto px-4 pb-4 pt-2 sm:px-6 [scrollbar-width:thin] snap-x snap-mandatory">
        {products.map((p) => (
          <div key={p.id} className="snap-start">
            <ProductCard product={p} size="compact" />
          </div>
        ))}
      </div>
    </section>
  )
}
