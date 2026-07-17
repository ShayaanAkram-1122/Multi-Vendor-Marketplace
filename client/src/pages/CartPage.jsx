import { Link } from 'react-router-dom'
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Truck,
  Tag,
} from 'lucide-react'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { useShopActivity } from '../context/ShopActivityContext'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');`

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function unitPrice(item) {
  const discount = Number(item.discountPercent) || 0
  const price = Number(item.price) || 0
  return discount > 0 ? price * (1 - discount / 100) : price
}

export default function CartPage() {
  const { user } = useAuth()
  const {
    cart,
    cartCount,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    lineTotal,
    deliveryLabel,
    deliveryLocation,
  } = useShopActivity()

  const listSubtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0,
  )
  const savings = Math.max(0, listSubtotal - cartSubtotal)

  return (
    <div className="min-h-screen bg-[#F3EEE1]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Header user={user} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#5C3A4B]">Your bag</p>
            <h1 className="mt-1 font-['Fraunces'] text-2xl text-[#2B2620] sm:text-3xl">
              {cartCount === 0 ? 'Nothing here yet' : 'Ready when you are'}
            </h1>
            <p className="mt-2 text-sm text-[#6E6455]">
              {cartCount === 0
                ? 'Find something handmade and bring it back here.'
                : `${cartCount} piece${cartCount === 1 ? '' : 's'} · ${formatMoney(cartSubtotal)} before shipping`}
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-[#5C3A4B] hover:text-[#2B2620]"
          >
            <ArrowLeft size={14} /> Continue shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="relative overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#FBF8F2]">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5C3A4B] via-[#D6A24A] to-[#6E7856]" />
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="px-6 py-14 sm:px-10 sm:py-16">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-sm bg-[#2B2620] text-[#EEE7D8]">
                  <ShoppingBag size={24} />
                </span>
                <h2 className="mt-6 font-['Fraunces'] text-2xl italic text-[#2B2620]">Your bag is empty</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[#6E6455]">
                  Ceramics, jewelry, prints, and vintage finds from independent makers — start with a browse
                  and save the pieces you love.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex rounded-sm bg-[#2B2620] px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B]"
                  >
                    Browse the shop
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-flex rounded-sm border border-[#D9CFBB] bg-white px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-[#2B2620] hover:border-[#5C3A4B]"
                  >
                    See AI picks
                  </Link>
                </div>
              </div>
              <div className="border-t border-[#D9CFBB] bg-[#EEE7D8]/50 px-6 py-10 sm:px-8 lg:border-l lg:border-t-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#9A9284]">While you browse</p>
                <ul className="mt-5 space-y-4 text-sm text-[#4A443A]">
                  <li className="flex gap-3">
                    <Truck size={16} className="mt-0.5 shrink-0 text-[#6E7856]" />
                    <span>Set a delivery location so makers know where pieces are headed.</span>
                  </li>
                  <li className="flex gap-3">
                    <Tag size={16} className="mt-0.5 shrink-0 text-[#6E7856]" />
                    <span>Watch for sale badges — discounted prices show in your bag automatically.</span>
                  </li>
                  <li className="flex gap-3">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#6E7856]" />
                    <span>Favourites keep pieces saved while you decide.</span>
                  </li>
                </ul>
                <Link
                  to="/delivery-location"
                  className="mt-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-[#5C3A4B] hover:underline"
                >
                  <MapPin size={13} />
                  {deliveryLocation ? deliveryLabel : 'Set delivery location'}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-['Fraunces'] text-xl text-[#2B2620]">Items in your bag</h2>
                <button
                  type="button"
                  onClick={clearCart}
                  className="font-mono text-[11px] uppercase tracking-wide text-[#5C3A4B] hover:underline cursor-pointer"
                >
                  Clear bag
                </button>
              </div>

              <ul className="divide-y divide-[#D9CFBB] overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#FBF8F2]">
                {cart.map((item) => {
                  const discount = Number(item.discountPercent) || 0
                  const unit = unitPrice(item)
                  return (
                    <li key={item.id} className="flex gap-4 p-4 sm:gap-5 sm:p-5">
                      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-sm border border-[#E7DFD0] bg-[#E4DCC8] sm:h-32 sm:w-32">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#9A9284]">
                            <ShoppingBag size={26} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-[10px] uppercase tracking-wide text-[#6E7856]">
                              {item.seller}
                            </p>
                            <h3 className="mt-0.5 font-['Fraunces'] text-base leading-snug text-[#2B2620] sm:text-lg">
                              {item.name}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-[#2B2620]">{formatMoney(unit)}</span>
                              {discount > 0 && (
                                <>
                                  <span className="text-xs text-[#9A9284] line-through">
                                    {formatMoney(item.price)}
                                  </span>
                                  <span className="rounded-full bg-[#D6A24A]/25 px-2 py-0.5 font-mono text-[10px] uppercase text-[#7A5A1A]">
                                    {discount}% off
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="rounded-sm p-2 text-[#5C3A4B] hover:bg-[#EEE7D8] cursor-pointer"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-sm border border-[#D9CFBB] bg-white">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-2 text-[#2B2620] hover:bg-[#EEE7D8] cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="min-w-10 border-x border-[#D9CFBB] px-2 py-2 text-center font-mono text-sm text-[#2B2620]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-2 text-[#2B2620] hover:bg-[#EEE7D8] cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="font-['Fraunces'] text-lg text-[#2B2620]">
                            {formatMoney(lineTotal(item))}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Truck, title: 'Makers ship direct', body: 'Each seller fulfills their own pieces.' },
                  { icon: ShieldCheck, title: 'Secure checkout', body: 'Payment stays protected end to end.' },
                  { icon: MapPin, title: 'Delivery address', body: deliveryLocation ? deliveryLabel : 'Add a location before checkout.' },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title} className="rounded-sm border border-[#D9CFBB]/80 bg-[#FBF8F2]/70 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-[#6E7856]" />
                      <p className="font-mono text-[10px] uppercase tracking-wide text-[#4A443A]">{title}</p>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#6E6455]">{body}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] shadow-[0_8px_24px_rgba(43,38,32,0.06)]">
                <div className="border-b border-[#D9CFBB] bg-[#2B2620] px-5 py-4 text-[#EEE7D8]">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#D6A24A]">Order summary</p>
                  <p className="mt-1 font-['Fraunces'] text-2xl italic">
                    {cartCount} item{cartCount === 1 ? '' : 's'}
                  </p>
                </div>

                <div className="space-y-3 px-5 py-5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6455]">Subtotal</span>
                    <span className="font-medium text-[#2B2620]">{formatMoney(listSubtotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex items-center justify-between text-[#6E7856]">
                      <span>Sale savings</span>
                      <span className="font-medium">−{formatMoney(savings)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6455]">Shipping</span>
                    <span className="font-mono text-[11px] uppercase tracking-wide text-[#9A9284]">At checkout</span>
                  </div>
                  <div className="border-t border-[#E7DFD0] pt-3">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">Estimated total</p>
                        <p className="font-['Fraunces'] text-2xl text-[#2B2620]">{formatMoney(cartSubtotal)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#D9CFBB] px-5 py-4">
                  <Link
                    to="/delivery-location"
                    className="mb-3 flex items-start gap-2 rounded-sm border border-[#E7DFD0] bg-white px-3 py-2.5 hover:border-[#5C3A4B]"
                  >
                    <MapPin size={14} className="mt-0.5 shrink-0 text-[#5C3A4B]" />
                    <span className="min-w-0 text-xs text-[#4A443A]">
                      <span className="block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">
                        Deliver to
                      </span>
                      <span className="mt-0.5 block truncate font-medium text-[#2B2620]">
                        {deliveryLocation ? deliveryLabel : 'Set delivery location'}
                      </span>
                    </span>
                  </Link>

                  <button
                    type="button"
                    className="w-full rounded-sm bg-[#2B2620] py-3 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B] cursor-pointer"
                  >
                    Proceed to checkout
                  </button>
                  <p className="mt-3 text-center text-[11px] leading-relaxed text-[#9A9284]">
                    Review your pieces, then continue to secure payment.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
