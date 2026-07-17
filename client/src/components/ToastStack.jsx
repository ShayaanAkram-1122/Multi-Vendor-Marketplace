import { useEffect } from 'react'
import { CheckCircle2, Heart, ShoppingBag, X } from 'lucide-react'
import { useShopActivity } from '../context/ShopActivityContext'

const ICONS = {
  favorite: Heart,
  cart: ShoppingBag,
  success: CheckCircle2,
}

export default function ToastStack() {
  const { toasts, dismissToast } = useShopActivity()

  if (!toasts?.length) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || CheckCircle2
        return (
          <ToastItem key={toast.id} toast={toast} Icon={Icon} onDismiss={() => dismissToast(toast.id)} />
        )
      })}
    </div>
  )
}

function ToastItem({ toast, Icon, onDismiss }) {
  useEffect(() => {
    if (!toast.duration) return undefined
    const t = setTimeout(onDismiss, toast.duration)
    return () => clearTimeout(t)
    // Only start the timer once per toast id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, toast.duration])

  return (
    <div className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] px-4 py-3 shadow-[0_8px_24px_rgba(43,38,32,0.18)] animate-[toast-in_0.25s_ease-out]">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-[#6E7856] text-[#EEE7D8]">
        <Icon size={16} fill={toast.type === 'favorite' ? 'currentColor' : 'none'} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#2B2620]">{toast.title}</p>
        {toast.body && <p className="mt-0.5 text-xs text-[#6E6455] truncate">{toast.body}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-sm p-0.5 text-[#9A9284] hover:text-[#2B2620] cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  )
}
