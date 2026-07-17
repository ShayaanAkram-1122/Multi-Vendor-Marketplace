import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpen, Mail, Send, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');`

const GUIDE_SECTIONS = [
  {
    title: 'Browse & shop',
    body: 'Open the Shop from the homepage or header. Search products, filter by category, and sort by price or newest. Tap a product card to see details from independent sellers.',
  },
  {
    title: 'Favourites',
    body: 'Tap the heart on any product to save it. Open the heart icon in the header to see your list. You’ll get a notification when something is added to favourites.',
  },
  {
    title: 'Shopping bag',
    body: 'Use the bag button on a product to add it to your cart. The header bag icon shows your item count — open it to change quantities, remove items, or go to your full bag.',
  },
  {
    title: 'Notifications',
    body: 'The bell icon shows alerts for favourites, cart adds, and account activity. Mark items read or unread, mark all read, or clear all from the dropdown.',
  },
  {
    title: 'Account & orders',
    body: 'Create a buyer or seller account via Register. Sign in to see your profile in the header. Track orders from “Track Order” in the top bar (coming soon for full order history).',
  },
  {
    title: 'Sell on Vendora',
    body: 'Choose Seller when registering to open your own stall. Sellers can list products and manage inventory from the seller dashboard (expanding soon).',
  },
  {
    title: 'New arrivals email',
    body: 'Subscribe on the homepage for new-arrival emails. You can choose Yes or No for regular product and discount alerts — like deal notifications on other marketplaces.',
  },
]

export default function HelpPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'contact' ? 'contact' : 'guide'
  const [tab, setTab] = useState(initialTab)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (user?.email && !form.email) {
      setForm((f) => ({ ...f, email: user.email }))
    }
    if (user?.name && !form.name) {
      setForm((f) => ({ ...f, name: user.name }))
    }
  }, [user, form.email, form.name])

  useEffect(() => {
    setTab(searchParams.get('tab') === 'contact' ? 'contact' : 'guide')
  }, [searchParams])

  const switchTab = (next) => {
    setTab(next)
    setSearchParams(next === 'contact' ? { tab: 'contact' } : {}, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not send your message')
      setSent(true)
    } catch (err) {
      setError(err.message || 'Could not send your message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F3EEE1]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Header user={user} />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/shop"
          className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-[#5C3A4B] hover:text-[#2B2620]"
        >
          <ArrowLeft size={14} />
          Back to shop
        </Link>

        <div className="overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] shadow-sm">
          <div className="border-b border-[#D9CFBB] bg-[#2B2620] px-5 py-5 text-[#EEE7D8]">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#D6A24A]">Support</p>
            <h1 className="font-['Fraunces'] text-3xl italic">Help centre</h1>
            <p className="mt-2 text-sm text-[#D9CFBB]">
              Guides for using Vendora and a form to reach our support team.
            </p>
          </div>

          <div className="flex border-b border-[#D9CFBB]">
            <button
              type="button"
              onClick={() => { switchTab('guide'); setSent(false) }}
              className={`flex flex-1 items-center justify-center gap-1.5 py-3 font-mono text-[11px] uppercase tracking-wide cursor-pointer ${
                tab === 'guide'
                  ? 'border-b-2 border-[#5C3A4B] text-[#5C3A4B] bg-[#EEE7D8]/40'
                  : 'text-[#6E6455] hover:bg-[#EEE7D8]/30'
              }`}
            >
              <BookOpen size={14} /> How it works
            </button>
            <button
              type="button"
              onClick={() => switchTab('contact')}
              className={`flex flex-1 items-center justify-center gap-1.5 py-3 font-mono text-[11px] uppercase tracking-wide cursor-pointer ${
                tab === 'contact'
                  ? 'border-b-2 border-[#5C3A4B] text-[#5C3A4B] bg-[#EEE7D8]/40'
                  : 'text-[#6E6455] hover:bg-[#EEE7D8]/30'
              }`}
            >
              <Mail size={14} /> Contact us
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {tab === 'guide' ? (
              <div className="space-y-4">
                <p className="text-sm text-[#6E6455]">
                  Quick guide to using Vendora — a marketplace for independent makers and thoughtful buyers.
                </p>
                {GUIDE_SECTIONS.map((section) => (
                  <div key={section.title} className="rounded-sm border border-[#E7DFD0] bg-white px-4 py-4">
                    <h2 className="font-['Fraunces'] text-lg text-[#2B2620]">{section.title}</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#4A443A]">{section.body}</p>
                  </div>
                ))}
              </div>
            ) : sent ? (
              <div className="py-12 text-center">
                <CheckCircle2 size={40} className="mx-auto text-[#6E7856]" />
                <p className="mt-4 font-['Fraunces'] text-2xl text-[#2B2620]">Message sent</p>
                <p className="mt-2 text-sm text-[#6E6455]">
                  Thanks — we&apos;ll get back to you at {form.email} as soon as we can.
                </p>
                <button
                  type="button"
                  onClick={() => { setSent(false); setForm((f) => ({ ...f, subject: '', message: '' })) }}
                  className="mt-8 font-mono text-xs uppercase tracking-wide text-[#5C3A4B] hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4">
                <p className="text-sm text-[#6E6455]">
                  Ask a question, report an issue, or request help with your account or order. Your message is sent to our support inbox.
                </p>
                <label className="block">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">Name</span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                    placeholder="Your name"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">Email</span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                    placeholder="you@email.com"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">Subject</span>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B] cursor-pointer"
                  >
                    <option value="">Choose a topic</option>
                    <option value="Order & delivery">Order & delivery</option>
                    <option value="Account & login">Account & login</option>
                    <option value="Selling on Vendora">Selling on Vendora</option>
                    <option value="Payments & refunds">Payments & refunds</option>
                    <option value="Technical issue">Technical issue</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">Message</span>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full resize-none rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                    placeholder="Describe your question or issue..."
                  />
                </label>
                {error && (
                  <p className="rounded-sm bg-[#5C3A4B]/10 px-3 py-2 text-sm text-[#5C3A4B]">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#2B2620] py-3 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B] disabled:opacity-60 cursor-pointer"
                >
                  <Send size={14} />
                  {loading ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
