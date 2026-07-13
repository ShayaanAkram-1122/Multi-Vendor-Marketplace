import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ShoppingBag, BellOff } from 'lucide-react'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');`

export default function NewsletterConfirmed() {
  const [params] = useSearchParams()
  const choice = (params.get('choice') || '').toLowerCase()
  const optedIn = choice === 'yes'

  const copy = useMemo(() => {
    if (optedIn) {
      return {
        icon: CheckCircle2,
        title: 'Regular updates enabled',
        body: 'You’ll get emails when sellers add new products or discounts — similar to deal alerts on Daraz or Temu.',
      }
    }
    return {
      icon: BellOff,
      title: 'Regular updates turned off',
      body: 'Got it — we won’t send new-product or discount alert emails. You’re still subscribed to Vendora.',
    }
  }, [optedIn])

  const Icon = copy.icon

  return (
    <div className="min-h-screen bg-[#F3EEE1] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <header className="border-b border-[#D9CFBB] bg-[#FBF8F2]">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-6 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#5C3A4B] text-[#EEE7D8]">
            <ShoppingBag size={16} />
          </span>
          <span className="font-['Fraunces'] text-xl italic text-[#2B2620]">Vendora</span>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] p-8 text-center shadow-sm">
          <Icon className={`mx-auto ${optedIn ? 'text-[#6E7856]' : 'text-[#9A9284]'}`} size={40} />
          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-[#5C3A4B]">Newsletter</p>
          <h1 className="mt-2 font-['Fraunces'] text-2xl text-[#2B2620]">{copy.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#6E6455]">{copy.body}</p>
          <Link
            to="/shop"
            className="mt-8 inline-block rounded-sm bg-[#2B2620] px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B]"
          >
            Go to shop
          </Link>
        </div>
      </main>
    </div>
  )
}
