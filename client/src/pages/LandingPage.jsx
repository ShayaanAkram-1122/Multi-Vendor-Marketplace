import { useState, useMemo } from 'react'
import {
  Search, Sparkles, ShoppingBag, MessageCircle, Star, ShieldCheck,
  TrendingUp, ArrowRight, Menu, X, Heart, BadgeCheck, Wallet, Bell,
} from 'lucide-react'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');`

const CATEGORIES = ['All', 'Home & Living', 'Jewelry', 'Art & Prints', 'Vintage', 'Wellness', 'Stationery']

const PRODUCTS = [
  { id: 1, name: 'Hand-thrown stoneware mug', seller: 'Marrow Ceramics', price: 32, rating: 4.9, category: 'Home & Living', aiPick: true, tilt: '-rotate-2' },
  { id: 2, name: 'Recycled silver hoop earrings', seller: 'Foundry & Co.', price: 48, rating: 4.8, category: 'Jewelry', aiPick: false, tilt: 'rotate-1' },
  { id: 3, name: 'Riso-print botanical set', seller: 'Paper Weeds Studio', price: 24, rating: 5.0, category: 'Art & Prints', aiPick: true, tilt: '-rotate-1' },
  { id: 4, name: '1970s brass table lamp', seller: 'Late Bloom Vintage', price: 96, rating: 4.7, category: 'Vintage', aiPick: false, tilt: 'rotate-2' },
  { id: 5, name: 'Lavender & oat soap bar', seller: 'Hollow Creek Apothecary', price: 12, rating: 4.9, category: 'Wellness', aiPick: true, tilt: '-rotate-2' },
  { id: 6, name: 'Letterpress notebook, ruled', seller: 'Type & Twine', price: 18, rating: 4.8, category: 'Stationery', aiPick: false, tilt: 'rotate-1' },
  { id: 7, name: 'Woven wall hanging, small', seller: 'Marrow Ceramics', price: 56, rating: 4.9, category: 'Home & Living', aiPick: false, tilt: '-rotate-1' },
  { id: 8, name: 'Freshwater pearl ring', seller: 'Foundry & Co.', price: 39, rating: 4.6, category: 'Jewelry', aiPick: true, tilt: 'rotate-2' },
]

const TESTIMONIALS = [
  { quote: "Vendora recommended a print shop I'd never have found on my own — it's now three of my favorite things on the wall.", name: 'Priya N.', role: 'Buyer since 2024' },
  { quote: 'The AI description tool turned my rambling notes into copy that actually sells. My views doubled the first week.', name: 'Tomás R.', role: 'Seller, Late Bloom Vintage' },
  { quote: 'Payouts land on time, every time, and buyers message me directly instead of guessing at sizing.', name: 'Aisha K.', role: 'Seller, Hollow Creek Apothecary' },
]

function StarRow({ rating }) {
  return (
    <span className="inline-flex items-center gap-1 text-[#B8860B]">
      <Star className="w-3.5 h-3.5 fill-current" />
      <span className="text-xs font-medium text-[#3A342E]">{rating}</span>
    </span>
  )
}

function TicketCard({ product }) {
  return (
    <div className={`relative shrink-0 w-56 bg-[#FFFDF9] border border-[#E7DFD0] rounded-sm shadow-[0_10px_24px_-14px_rgba(43,25,12,0.35)] p-4 ${product.tilt} hover:rotate-0 transition-transform duration-300`}>
      <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-[#FAF7F2] border border-[#E7DFD0]" />
      {product.aiPick && (
        <div className="absolute -top-3 right-3 bg-[#5B2145] text-[#F4E9EE] text-[10px] font-mono tracking-wide uppercase px-2 py-1 rounded-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> AI Pick
        </div>
      )}
      <div className="h-28 rounded-sm bg-gradient-to-br from-[#EFE6D8] to-[#E2D5BE] mb-3 flex items-center justify-center text-[#B8A98C]">
        <ShoppingBag className="w-8 h-8" />
      </div>
      <p className="font-['Fraunces'] text-[15px] leading-snug text-[#231F1C] mb-1">{product.name}</p>
      <p className="text-xs text-[#8A7F6E] mb-2">{product.seller}</p>
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-[#5B2145]">${product.price}</span>
        <StarRow rating={product.rating} />
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const inCat = category === 'All' || p.category === category
      const inQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.seller.toLowerCase().includes(query.toLowerCase())
      return inCat && inQuery
    })
  }, [category, query])

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231F1C]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur border-b border-[#E7DFD0]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-[#5B2145] flex items-center justify-center text-[#F4E9EE]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="font-['Fraunces'] font-semibold text-lg tracking-tight">Vendora</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#4A423A]">
            <a href="#shop" className="hover:text-[#5B2145] transition-colors">Shop</a>
            <a href="#ai" className="hover:text-[#5B2145] transition-colors">How AI helps</a>
            <a href="#sell" className="hover:text-[#5B2145] transition-colors">Sell on Vendora</a>
            <a href="#stories" className="hover:text-[#5B2145] transition-colors">Stories</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button type="button" className="text-sm text-[#4A423A] hover:text-[#5B2145] transition-colors">Log in</button>
            <button type="button" className="text-sm bg-[#5B2145] text-[#F4E9EE] px-4 py-2 rounded-sm hover:bg-[#471735] transition-colors">
              Start shopping
            </button>
          </div>
          <button type="button" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 pb-4 flex flex-col gap-3 text-sm text-[#4A423A] border-t border-[#E7DFD0] pt-3">
            <a href="#shop">Shop</a>
            <a href="#ai">How AI helps</a>
            <a href="#sell">Sell on Vendora</a>
            <a href="#stories">Stories</a>
            <button type="button" className="text-left bg-[#5B2145] text-[#F4E9EE] px-4 py-2 rounded-sm w-fit mt-1">Start shopping</button>
          </div>
        )}
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-14 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[#5B2145] bg-[#F1E4EA] px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Multi-vendor · AI-matched
          </div>
          <h1 className="font-['Fraunces'] text-[42px] sm:text-[52px] leading-[1.05] tracking-tight mb-5">
            Shop small.<br />Matched by <span className="italic text-[#5B2145]">AI</span>.
          </h1>
          <p className="text-[#4A423A] text-[17px] leading-relaxed max-w-md mb-8">
            Thousands of independent sellers under one roof. Vendora learns what you love and
            surfaces it first — every purchase paid safely, every seller a real person you can message.
          </p>

          <div className="flex items-center bg-white border border-[#E7DFD0] rounded-sm shadow-sm px-4 py-3 mb-5 max-w-md">
            <Search className="w-4 h-4 text-[#8A7F6E] shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hand-poured candles, ceramics, prints…"
              className="ml-3 flex-1 outline-none text-sm bg-transparent placeholder:text-[#8A7F6E]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.slice(1, 5).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setCategory(c); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }) }}
                className="text-xs font-medium text-[#4A423A] bg-white border border-[#E7DFD0] px-3 py-1.5 rounded-full hover:border-[#5B2145] hover:text-[#5B2145] transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 md:flex-wrap md:justify-end -mr-6 md:mr-0 pl-6 md:pl-0">
          {PRODUCTS.slice(0, 4).map((p) => <TicketCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="border-y border-[#E7DFD0] bg-white/60">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-6 text-sm text-[#4A423A]">
          <span><strong className="text-[#231F1C]">12,400+</strong> independent sellers</span>
          <span><strong className="text-[#231F1C]">2.1M</strong> products listed</span>
          <span><strong className="text-[#231F1C]">4.8★</strong> average seller rating</span>
          <span><strong className="text-[#231F1C]">&lt;2hr</strong> average reply time</span>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E7DFD0] rounded-md p-8">
          <ShoppingBag className="w-6 h-6 text-[#5B2145] mb-4" />
          <h3 className="font-['Fraunces'] text-2xl mb-3">Built for browsing, not scrolling</h3>
          <ul className="space-y-3 text-sm text-[#4A423A]">
            <li className="flex gap-2"><Sparkles className="w-4 h-4 mt-0.5 text-[#5B2145] shrink-0" /> Recommendations that learn from what you save and buy</li>
            <li className="flex gap-2"><MessageCircle className="w-4 h-4 mt-0.5 text-[#5B2145] shrink-0" /> Message any seller directly before you buy</li>
            <li className="flex gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 text-[#5B2145] shrink-0" /> Every checkout secured through Stripe</li>
          </ul>
        </div>
        <div id="sell" className="bg-[#231F1C] text-[#F4EFE6] rounded-md p-8">
          <TrendingUp className="w-6 h-6 text-[#E8A93B] mb-4" />
          <h3 className="font-['Fraunces'] text-2xl mb-3">Built to help you sell</h3>
          <ul className="space-y-3 text-sm text-[#D8CFC0]">
            <li className="flex gap-2"><Sparkles className="w-4 h-4 mt-0.5 text-[#E8A93B] shrink-0" /> AI writes your first product description — you edit from there</li>
            <li className="flex gap-2"><TrendingUp className="w-4 h-4 mt-0.5 text-[#E8A93B] shrink-0" /> Revenue, views, and conversion in one dashboard</li>
            <li className="flex gap-2"><Wallet className="w-4 h-4 mt-0.5 text-[#E8A93B] shrink-0" /> Automatic payouts, no invoicing required</li>
          </ul>
          <button type="button" className="mt-6 inline-flex items-center gap-2 text-sm bg-[#E8A93B] text-[#231F1C] font-medium px-4 py-2.5 rounded-sm hover:bg-[#d99c2f] transition-colors">
            Open your shop <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section id="shop" className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#8A7F6E] mb-2">Today&apos;s picks</div>
            <h2 className="font-['Fraunces'] text-3xl">Fresh from the stalls</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  category === c
                    ? 'bg-[#5B2145] text-[#F4E9EE] border-[#5B2145]'
                    : 'bg-white text-[#4A423A] border-[#E7DFD0] hover:border-[#5B2145]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-[#8A7F6E] py-12 text-center">No matches yet — try another search or category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <div key={p.id} className="group bg-white border border-[#E7DFD0] rounded-md overflow-hidden hover:shadow-[0_14px_30px_-18px_rgba(43,25,12,0.4)] transition-shadow">
                <div className="relative h-32 bg-gradient-to-br from-[#EFE6D8] to-[#E2D5BE] flex items-center justify-center text-[#B8A98C]">
                  <ShoppingBag className="w-7 h-7" />
                  <button type="button" className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-[#8A7F6E] hover:text-[#5B2145] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                  {p.aiPick && (
                    <span className="absolute bottom-2 left-2 text-[9px] font-mono uppercase tracking-wide bg-[#5B2145] text-[#F4E9EE] px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> AI pick
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[13px] leading-snug mb-1">{p.name}</p>
                  <p className="text-[11px] text-[#8A7F6E] mb-2">{p.seller}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] text-[#5B2145]">${p.price}</span>
                    <StarRow rating={p.rating} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="ai" className="bg-[#F1E4EA] mt-20">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-lg mb-12">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#5B2145] mb-2">How the AI helps</div>
            <h2 className="font-['Fraunces'] text-3xl mb-3">Quiet AI, doing the tedious parts</h2>
            <p className="text-[#4A423A] text-[15px]">It doesn&apos;t replace the seller&apos;s voice or your judgment — it clears the busywork out of the way.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-md p-6 border border-[#E7DFD0]">
              <Sparkles className="w-5 h-5 text-[#5B2145] mb-4" />
              <h4 className="font-['Fraunces'] text-lg mb-2">Recommendations that fit</h4>
              <p className="text-sm text-[#4A423A] mb-4">Built from what you browse and buy, not just what&apos;s trending.</p>
              <div className="flex gap-2">
                {PRODUCTS.slice(4, 7).map((p) => (
                  <div key={p.id} className="flex-1 h-14 rounded-sm bg-gradient-to-br from-[#EFE6D8] to-[#E2D5BE]" />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-md p-6 border border-[#E7DFD0]">
              <MessageCircle className="w-5 h-5 text-[#5B2145] mb-4" />
              <h4 className="font-['Fraunces'] text-lg mb-2">Descriptions that write themselves</h4>
              <p className="text-sm text-[#4A423A] mb-3">Sellers enter a few keywords — a first draft comes back in seconds.</p>
              <div className="bg-[#FAF7F2] border border-[#E7DFD0] rounded-sm p-3 font-mono text-[11px] text-[#4A423A] leading-relaxed">
                <span className="text-[#8A7F6E]">keywords:</span> stoneware, matte glaze, dishwasher-safe<br />
                <span className="text-[#5B2145]">→ &quot;Thrown by hand in small batches, finished in a soft matte glaze that&apos;s kind to your morning light.&quot;</span>
              </div>
            </div>

            <div className="bg-white rounded-md p-6 border border-[#E7DFD0]">
              <TrendingUp className="w-5 h-5 text-[#5B2145] mb-4" />
              <h4 className="font-['Fraunces'] text-lg mb-2">A dashboard that explains itself</h4>
              <p className="text-sm text-[#4A423A] mb-4">Views, conversion, and revenue — plotted, not buried in a spreadsheet.</p>
              <div className="flex items-end gap-1.5 h-14">
                {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#5B2145]/80 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stories" className="max-w-6xl mx-auto px-6 py-20">
        <div className="font-mono text-[11px] uppercase tracking-widest text-[#8A7F6E] mb-2 text-center">From the market</div>
        <h2 className="font-['Fraunces'] text-3xl mb-12 text-center">Buyers and sellers, in their own words</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white border border-[#E7DFD0] rounded-md p-6">
              <BadgeCheck className="w-5 h-5 text-[#5B2145] mb-4" />
              <p className="text-[#3A342E] text-[14.5px] leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-[#8A7F6E]">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#231F1C] text-[#F4EFE6]">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <Bell className="w-6 h-6 text-[#E8A93B] mx-auto mb-5" />
          <h2 className="font-['Fraunces'] text-3xl sm:text-4xl mb-4">Come see what&apos;s in the stalls today</h2>
          <p className="text-[#D8CFC0] max-w-md mx-auto mb-8">Free to browse, free to join. Sellers keep full control of their shop, their prices, their voice.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="bg-[#E8A93B] text-[#231F1C] font-medium px-6 py-3 rounded-sm hover:bg-[#d99c2f] transition-colors inline-flex items-center gap-2">
              Start shopping <ArrowRight className="w-4 h-4" />
            </button>
            <button type="button" className="border border-[#4A423A] text-[#F4EFE6] px-6 py-3 rounded-sm hover:border-[#E8A93B] transition-colors">
              Open your shop
            </button>
          </div>
        </div>
        <div className="border-t border-[#3A342E]">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap justify-between gap-3 text-xs text-[#8A7F6E] font-mono">
            <span>Vendora — AI-powered multi-vendor marketplace</span>
            <span>Home &amp; Living · Jewelry · Art &amp; Prints · Vintage · Wellness · Stationery</span>
          </div>
        </div>
      </section>
    </div>
  )
}
