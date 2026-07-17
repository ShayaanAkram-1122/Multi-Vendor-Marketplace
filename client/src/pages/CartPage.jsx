import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { useShopActivity } from '../context/ShopActivityContext'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');`

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
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
  } = useShopActivity()

  return (
    <div className="min-h-screen bg-[#F3EEE1]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Header user={user} />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#5C3A4B]">Checkout prep</p>
            <h1 className="font-['Fraunces'] text-3xl text-[#2B2620]">Your bag</h1>
            <p className="mt-1 text-sm text-[#6E6455]">
              {cartCount === 0 ? 'No items yet' : `${cartCount} item${cartCount === 1 ? '' : 's'} ready`}
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-[#5C3A4B] hover:underline"
          >
            <ArrowLeft size={14} /> Continue shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] px-6 py-16 text-center">
            <ShoppingBag size={32} className="mx-auto text-[#D9CFBB]" />
            <p className="mt-4 font-['Fraunces'] text-xl text-[#2B2620]">Your bag is empty</p>
            <p className="mt-2 text-sm text-[#6E6455]">Browse the shop and add pieces you love.</p>
            <Link
              to="/shop"
              className="mt-6 inline-block rounded-sm bg-[#2B2620] px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B]"
            >
              Go to shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-3">
              {cart.map((item) => {
                const discount = Number(item.discountPercent) || 0
                const unit = discount > 0 ? item.price * (1 - discount / 100) : item.price
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] p-4"
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#E4DCC8]">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#9A9284]">
                          <ShoppingBag size={22} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-wide text-[#6E7856]">{item.seller}</p>
                          <h2 className="font-['Fraunces'] text-lg text-[#2B2620]">{item.name}</h2>
                          <p className="mt-1 text-sm text-[#4A443A]">
                            {formatMoney(unit)}
                            {discount > 0 && (
                              <span className="ml-2 text-xs text-[#9A9284] line-through">{formatMoney(item.price)}</span>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="rounded-sm p-1.5 text-[#5C3A4B] hover:bg-[#EEE7D8] cursor-pointer"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="rounded-sm border border-[#D9CFBB] p-1.5 hover:bg-[#EEE7D8] cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-8 text-center font-mono text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="rounded-sm border border-[#D9CFBB] p-1.5 hover:bg-[#EEE7D8] cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-medium text-[#2B2620]">{formatMoney(lineTotal(item))}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={clearCart}
                className="font-mono text-xs uppercase tracking-wide text-[#5C3A4B] hover:underline cursor-pointer"
              >
                Clear bag
              </button>
            </div>

            <aside className="h-fit rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] p-5">
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#9A9284]">Order summary</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-[#6E6455]">Subtotal</span>
                <span className="font-medium text-[#2B2620]">{formatMoney(cartSubtotal)}</span>
              </div>
              <p className="mt-2 text-[11px] text-[#9A9284]">Shipping and taxes calculated at checkout.</p>
              <button
                type="button"
                className="mt-5 w-full rounded-sm bg-[#2B2620] py-2.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B] cursor-pointer"
              >
                Proceed to checkout
              </button>
              <p className="mt-3 text-center text-[11px] text-[#9A9284]">
                Stripe checkout lands here next.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
