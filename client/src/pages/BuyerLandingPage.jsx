import { useEffect, useState } from 'react'
import Header from '../components/Header'
import HeroFlatlay from '../components/HeroFlatlay'
import CategoryShelf from '../components/CategoryShelf'
import ProductCard from '../components/ProductCard'
import { fetchProducts, getAiPicks, getByCategory } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['Home & Living', 'Jewelry', 'Art & Prints', 'Vintage', 'Wellness', 'Stationery']

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');`

export default function BuyerLandingPage() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [gridData, setGridData] = useState({ data: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [aiPicks, setAiPicks] = useState([])
  const [shelves, setShelves] = useState({})

  useEffect(() => {
    getAiPicks(10).then(setAiPicks)
    Promise.all(
      CATEGORIES.map(async (cat) => [cat, await getByCategory(cat, 10)]),
    ).then((entries) => setShelves(Object.fromEntries(entries)))
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchProducts({ page, limit: 12, category: activeCategory, search, sort })
      .then(setGridData)
      .finally(() => setLoading(false))
  }, [page, activeCategory, search, sort])

  useEffect(() => {
    setPage(1)
  }, [activeCategory, search, sort])

  return (
    <div className="min-h-screen bg-[#F3EEE1]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Header
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onSearch={setSearch}
        user={user}
      />

      <HeroFlatlay featured={aiPicks} onSearch={setSearch} />

      {!activeCategory && !search && (
        <>
          <CategoryShelf
            title="Curated for you"
            subtitle="Picks our recommendation engine thinks you'll love"
            products={aiPicks}
            onSeeAll={() => setActiveCategory(null)}
          />
          {CATEGORIES.map((cat) => (
            <CategoryShelf
              key={cat}
              title={cat}
              products={shelves[cat] || []}
              onSeeAll={() => setActiveCategory(cat)}
            />
          ))}
        </>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-['Fraunces'] text-2xl text-[#2B2620]">
            {activeCategory ?? (search ? `Results for "${search}"` : 'All products')}
          </h2>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-[#4A443A] cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-sm bg-[#E4DCC8]" />
            ))}
          </div>
        ) : gridData.data.length === 0 ? (
          <p className="py-16 text-center font-mono text-sm text-[#9A9284]">
            No products match yet — try a different search or category.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {gridData.data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {gridData.pagination?.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-sm border border-[#D9CFBB] px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-[#4A443A] disabled:opacity-30 cursor-pointer"
            >
              Prev
            </button>
            <span className="font-mono text-xs text-[#4A443A]">
              Page {gridData.pagination.page} of {gridData.pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= gridData.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-sm border border-[#D9CFBB] px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-[#4A443A] disabled:opacity-30 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
