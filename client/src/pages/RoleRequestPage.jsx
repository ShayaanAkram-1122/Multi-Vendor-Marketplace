import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRightLeft, CheckCircle2, Clock } from 'lucide-react'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { fetchMyRoleRequest, submitRoleRequest } from '../services/roleRequestApi'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');`

export default function RoleRequestPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [info, setInfo] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/role-request' } })
      return
    }
    if (user.role === 'admin') {
      setLoading(false)
      setInfo({ allowed: false, reason: 'Admin roles cannot be changed.' })
      return
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchMyRoleRequest()
        if (!cancelled) setInfo(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load role request status')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const data = await submitRoleRequest(message)
      setSuccess(data.message || 'Request submitted')
      setInfo((prev) => ({
        ...prev,
        request: data.request,
      }))
    } catch (err) {
      setError(err.message || 'Could not submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const pending = info?.request?.status === 'pending'
  const targetRole = info?.requestedRole || (user?.role === 'buyer' ? 'seller' : 'buyer')

  return (
    <div className="min-h-screen bg-[#F3EEE1]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Header user={user} />

      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <Link
          to="/shop"
          className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-[#5C3A4B] hover:text-[#2B2620]"
        >
          <ArrowLeft size={14} />
          Back to shop
        </Link>

        <div className="overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] shadow-sm">
          <div className="border-b border-[#D9CFBB] bg-[#2B2620] px-5 py-5 text-[#EEE7D8]">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#D6A24A]">Account</p>
            <h1 className="font-['Fraunces'] text-3xl italic">Request to change roles</h1>
            <p className="mt-2 text-sm text-[#D9CFBB]">
              Buyers can request to become sellers, and sellers can request to become buyers. Admin roles stay fixed.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <p className="text-sm text-[#9A9284]">Loading…</p>
            ) : info && !info.allowed ? (
              <p className="rounded-sm bg-[#5C3A4B]/10 px-3 py-3 text-sm text-[#5C3A4B]">
                {info.reason || 'Role changes are not available for this account.'}
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-sm border border-[#E7DFD0] bg-white px-4 py-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#6E7856] text-[#EEE7D8]">
                    <ArrowRightLeft size={18} />
                  </span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">Current → requested</p>
                    <p className="font-['Fraunces'] text-lg text-[#2B2620]">
                      {info?.currentRole || user?.role} → {targetRole}
                    </p>
                  </div>
                </div>

                {pending ? (
                  <div className="rounded-sm border border-[#D6A24A]/40 bg-[#D6A24A]/10 px-4 py-4">
                    <div className="flex items-start gap-2">
                      <Clock size={18} className="mt-0.5 text-[#7A5A1A]" />
                      <div>
                        <p className="font-medium text-[#2B2620]">Request pending</p>
                        <p className="mt-1 text-sm text-[#6E6455]">
                          An admin will review your request to become a <strong>{info.request.toRole}</strong>.
                          You’ll keep your current role until it’s approved.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : info?.request?.status === 'approved' ? (
                  <div className="rounded-sm border border-[#6E7856]/30 bg-[#6E7856]/10 px-4 py-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={18} className="mt-0.5 text-[#6E7856]" />
                      <div>
                        <p className="font-medium text-[#2B2620]">Previous request approved</p>
                        <p className="mt-1 text-sm text-[#6E6455]">
                          Sign out and sign back in if your account still shows the old role.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {!pending && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">
                        Note for admins (optional)
                      </span>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full resize-none rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                        placeholder={
                          targetRole === 'seller'
                            ? 'Why you’d like to sell on Vendora…'
                            : 'Why you’d like to switch back to buying…'
                        }
                      />
                    </label>

                    {error && (
                      <p className="rounded-sm bg-[#5C3A4B]/10 px-3 py-2 text-sm text-[#5C3A4B]">{error}</p>
                    )}
                    {success && (
                      <p className="flex items-center gap-2 rounded-sm bg-[#6E7856]/15 px-3 py-2 text-sm text-[#6E7856]">
                        <CheckCircle2 size={16} /> {success}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#2B2620] px-4 py-3 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B] disabled:opacity-60 cursor-pointer"
                    >
                      <ArrowRightLeft size={14} />
                      {submitting ? 'Submitting…' : `Request ${targetRole} role`}
                    </button>
                  </form>
                )}

                {error && pending && (
                  <p className="rounded-sm bg-[#5C3A4B]/10 px-3 py-2 text-sm text-[#5C3A4B]">{error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
