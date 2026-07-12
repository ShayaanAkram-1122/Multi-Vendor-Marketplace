import { Heart, Bell, Check, Circle, Trash2, X } from 'lucide-react'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function NotificationsPanel({
  open,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAsUnread,
  onMarkAllAsRead,
  onClearAll,
}) {
  if (!open) return null

  return (
    <div className="absolute right-0 top-9 z-40 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] shadow-xl">
      <div className="flex items-center justify-between border-b border-[#D9CFBB] px-3 py-2.5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-[#5C3A4B]">Notifications</p>
          <p className="text-[11px] text-[#9A9284]">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          className="rounded-sm p-1 text-[#9A9284] hover:bg-[#EEE7D8] hover:text-[#2B2620] cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-[#D9CFBB] px-3 py-2">
        <button
          type="button"
          onClick={onMarkAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-1 rounded-sm border border-[#D9CFBB] px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-[#4A443A] hover:bg-[#EEE7D8] disabled:opacity-40 cursor-pointer"
        >
          <Check size={11} /> Mark all read
        </button>
        <button
          type="button"
          onClick={onClearAll}
          disabled={notifications.length === 0}
          className="inline-flex items-center gap-1 rounded-sm border border-[#D9CFBB] px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-[#5C3A4B] hover:bg-[#EEE7D8] disabled:opacity-40 cursor-pointer"
        >
          <Trash2 size={11} /> Clear all
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell size={22} className="mx-auto text-[#D9CFBB]" />
            <p className="mt-2 text-sm text-[#6E6455]">No notifications yet</p>
            <p className="mt-1 text-[11px] text-[#9A9284]">Favourite a product to see updates here.</p>
          </div>
        ) : (
          <ul>
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`border-b border-[#E7DFD0] px-3 py-3 last:border-b-0 ${
                  n.read ? 'bg-transparent' : 'bg-[#EEE7D8]/55'
                }`}
              >
                <div className="flex gap-2.5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#E4DCC8]">
                    {n.image ? (
                      <img src={n.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Heart size={14} className="text-[#5C3A4B]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-[#2B2620]">{n.title}</p>
                      {!n.read && (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5C3A4B]" aria-label="Unread" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] leading-snug text-[#6E6455]">{n.body}</p>
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">
                      {timeAgo(n.createdAt)}
                    </p>
                    <div className="mt-2 flex gap-2">
                      {n.read ? (
                        <button
                          type="button"
                          onClick={() => onMarkAsUnread(n.id)}
                          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-[#5C3A4B] hover:underline cursor-pointer"
                        >
                          <Circle size={10} /> Mark unread
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onMarkAsRead(n.id)}
                          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-[#5C3A4B] hover:underline cursor-pointer"
                        >
                          <Check size={10} /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
