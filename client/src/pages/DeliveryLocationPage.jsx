import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Crosshair,
  Map as MapIcon,
  MapPin,
  Navigation,
  PenLine,
  Plus,
  Trash2,
} from 'lucide-react'
import Header from '../components/Header'
import LocationMap from '../components/LocationMap'
import { useAuth } from '../context/AuthContext'
import { useShopActivity } from '../context/ShopActivityContext'

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');`

const EMPTY_FORM = {
  label: '',
  address: '',
  city: '',
  region: '',
  country: '',
  postalCode: '',
  lat: '',
  lng: '',
}

function placeShortLabel(parts) {
  const { city, region, country, address } = parts
  if (city && country) return `${city}, ${country}`
  if (city && region) return `${city}, ${region}`
  if (city) return city
  if (region && country) return `${region}, ${country}`
  if (region) return region
  if (address && country) return `${address}, ${country}`
  if (address) return address
  if (country) return country
  return 'Pinned location'
}

function buildLabel(parts) {
  if (parts.label?.trim()) return parts.label.trim()
  return placeShortLabel(parts)
}

function locationToForm(loc) {
  if (!loc) return { ...EMPTY_FORM }
  return {
    label: loc.label || '',
    address: loc.address || '',
    city: loc.city || '',
    region: loc.region || '',
    country: loc.country || '',
    postalCode: loc.postalCode || '',
    lat: loc.lat ?? '',
    lng: loc.lng ?? '',
  }
}

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Could not look up that map point')
  const data = await res.json()
  const a = data.address || {}
  const city =
    a.city ||
    a.town ||
    a.village ||
    a.municipality ||
    a.suburb ||
    a.neighbourhood ||
    a.hamlet ||
    a.county ||
    ''
  return {
    address: [a.house_number, a.road].filter(Boolean).join(' ') || data.display_name?.split(',')[0] || '',
    city,
    region: a.state || a.region || a.province || '',
    country: a.country || '',
    postalCode: a.postcode || '',
    lat: Number(lat),
    lng: Number(lng),
  }
}

async function forwardGeocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Could not find that address on the map')
  const results = await res.json()
  if (!results?.length) throw new Error('No map match found for that address')
  const hit = results[0]
  const a = hit.address || {}
  const city =
    a.city ||
    a.town ||
    a.village ||
    a.municipality ||
    a.suburb ||
    a.neighbourhood ||
    a.hamlet ||
    a.county ||
    ''
  return {
    address: [a.house_number, a.road].filter(Boolean).join(' ') || hit.display_name?.split(',')[0] || query,
    city,
    region: a.state || a.region || a.province || '',
    country: a.country || '',
    postalCode: a.postcode || '',
    lat: Number(hit.lat),
    lng: Number(hit.lon),
  }
}

export default function DeliveryLocationPage() {
  const { user } = useAuth()
  const { deliveryLocation, saveDeliveryLocation, clearDeliveryLocation, ready } = useShopActivity()

  // view = show saved location + actions; edit/add = show form
  const [mode, setMode] = useState('add')
  const [tab, setTab] = useState('manual')
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!ready || initialized) return
    setForm(locationToForm(deliveryLocation))
    setMode(deliveryLocation ? 'view' : 'add')
    setInitialized(true)
  }, [ready, deliveryLocation, initialized])

  const showForm = !ready || !initialized
    ? false
    : mode === 'edit' || mode === 'add' || !deliveryLocation

  const showView = ready && initialized && deliveryLocation && mode === 'view'

  const startEdit = () => {
    setForm(locationToForm(deliveryLocation))
    setMode('edit')
    setTab('manual')
    setError('')
    setSaved(false)
  }

  const startAddNew = () => {
    setForm({ ...EMPTY_FORM })
    setMode('add')
    setTab('manual')
    setError('')
    setSaved(false)
  }

  const cancelForm = () => {
    if (deliveryLocation) {
      setForm(locationToForm(deliveryLocation))
      setMode('view')
    } else {
      setForm({ ...EMPTY_FORM })
      setMode('add')
    }
    setError('')
    setSaved(false)
  }

  const updateField = (key, value) => {
    setSaved(false)
    setError('')
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleMapPick = async (lat, lng) => {
    setError('')
    setLoading(true)
    setSaved(false)
    try {
      const found = await reverseGeocode(lat, lng)
      // Always refresh short label for the newly picked place
      setForm({
        ...EMPTY_FORM,
        ...found,
        label: placeShortLabel(found),
        lat,
        lng,
      })
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        lat,
        lng,
        label: placeShortLabel({ ...prev, lat, lng }),
      }))
      setError(err.message || 'Picked coordinates, but address lookup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser')
      return
    }
    setError('')
    setLoading(true)
    setSaved(false)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setTab('map')
        await handleMapPick(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        setLoading(false)
        setError('Location permission denied or unavailable')
      },
      { enableHighAccuracy: true, timeout: 12000 },
    )
  }

  const handleFindOnMap = async () => {
    const query = [form.address, form.city, form.region, form.country, form.postalCode]
      .filter(Boolean)
      .join(', ')
    if (!query.trim()) {
      setError('Enter an address or city first, then find it on the map')
      return
    }
    setError('')
    setLoading(true)
    setSaved(false)
    try {
      const found = await forwardGeocode(query)
      setForm({
        ...EMPTY_FORM,
        ...found,
        label: placeShortLabel(found),
      })
      setTab('map')
    } catch (err) {
      setError(err.message || 'Could not find that address on the map')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (source) => {
    setError('')
    if (!form.address.trim() && !form.city.trim() && !form.country.trim() && form.lat === '') {
      setError('Add an address manually or pick a point on the map')
      return
    }
    saveDeliveryLocation({
      ...form,
      label: buildLabel(form),
      source,
    })
    setSaved(true)
    setMode('view')
  }

  const handleClear = () => {
    clearDeliveryLocation()
    setForm({ ...EMPTY_FORM })
    setMode('add')
    setSaved(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-[#F3EEE1]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Header user={user} />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          to="/shop"
          className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-[#5C3A4B] hover:text-[#2B2620]"
        >
          <ArrowLeft size={14} />
          Back to shop
        </Link>

        <div className="overflow-hidden rounded-sm border border-[#D9CFBB] bg-[#FBF8F2] shadow-sm">
          <div className="border-b border-[#D9CFBB] bg-[#2B2620] px-5 py-5 text-[#EEE7D8]">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#D6A24A]">Shipping</p>
            <h1 className="font-['Fraunces'] text-3xl italic">Delivery location</h1>
            <p className="mt-2 text-sm text-[#D9CFBB]">
              {deliveryLocation && mode === 'view'
                ? 'Edit your saved location, clear it, or add a new one.'
                : 'Enter an address yourself, or drop a pin on the world map.'}
            </p>
          </div>

          {showView && (
            <div className="p-5 sm:p-6">
              <div className="rounded-sm border border-[#E7DFD0] bg-white px-4 py-4">
                <div className="flex items-start gap-2">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-[#5C3A4B]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">Current location</p>
                    <p className="mt-1 font-['Fraunces'] text-xl text-[#2B2620]">
                      {deliveryLocation.label || placeShortLabel(deliveryLocation)}
                    </p>
                    <p className="mt-1 text-sm text-[#6E6455]">
                      {[
                        deliveryLocation.address,
                        deliveryLocation.city,
                        deliveryLocation.region,
                        deliveryLocation.country,
                        deliveryLocation.postalCode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {deliveryLocation.lat != null && deliveryLocation.lng != null && (
                      <p className="mt-1 font-mono text-[11px] text-[#9A9284]">
                        {Number(deliveryLocation.lat).toFixed(5)}, {Number(deliveryLocation.lng).toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-[#E7DFD0] pt-4">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="inline-flex items-center gap-2 rounded-sm bg-[#2B2620] px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B] cursor-pointer"
                  >
                    <PenLine size={14} />
                    Edit location
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-2 rounded-sm border border-[#D9CFBB] bg-white px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-[#5C3A4B] hover:border-[#5C3A4B] cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Clear location
                  </button>
                  <button
                    type="button"
                    onClick={startAddNew}
                    className="inline-flex items-center gap-2 rounded-sm border border-[#D9CFBB] bg-white px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-[#2B2620] hover:border-[#5C3A4B] cursor-pointer"
                  >
                    <Plus size={14} />
                    Add new location
                  </button>
                </div>
              </div>
            </div>
          )}

          {showForm && (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-[#D9CFBB] bg-[#EEE7D8]/40 px-5 py-3">
                <p className="font-mono text-[11px] uppercase tracking-wide text-[#5C3A4B]">
                  {mode === 'edit' ? 'Editing location' : 'Adding new location'}
                </p>
                {deliveryLocation && (
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="font-mono text-[11px] uppercase tracking-wide text-[#6E6455] hover:text-[#2B2620] cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="flex border-b border-[#D9CFBB]">
                <button
                  type="button"
                  onClick={() => setTab('manual')}
                  className={`flex flex-1 items-center justify-center gap-1.5 py-3 font-mono text-[11px] uppercase tracking-wide cursor-pointer ${
                    tab === 'manual'
                      ? 'border-b-2 border-[#5C3A4B] text-[#5C3A4B] bg-[#EEE7D8]/40'
                      : 'text-[#6E6455] hover:bg-[#EEE7D8]/30'
                  }`}
                >
                  <PenLine size={14} /> Enter address
                </button>
                <button
                  type="button"
                  onClick={() => setTab('map')}
                  className={`flex flex-1 items-center justify-center gap-1.5 py-3 font-mono text-[11px] uppercase tracking-wide cursor-pointer ${
                    tab === 'map'
                      ? 'border-b-2 border-[#5C3A4B] text-[#5C3A4B] bg-[#EEE7D8]/40'
                      : 'text-[#6E6455] hover:bg-[#EEE7D8]/30'
                  }`}
                >
                  <MapIcon size={14} /> World map
                </button>
              </div>

              <div className="p-5 sm:p-6">
                {tab === 'manual' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-[#6E6455]">
                      Type your delivery details. Optionally find them on the map to confirm coordinates.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">
                          Short label
                        </span>
                        <input
                          type="text"
                          value={form.label}
                          onChange={(e) => updateField('label', e.target.value)}
                          className="w-full rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                          placeholder="Updates when you pick a place on the map"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">
                          Street address
                        </span>
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) => updateField('address', e.target.value)}
                          className="w-full rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                          placeholder="123 Maker Lane"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">City</span>
                        <input
                          type="text"
                          value={form.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          className="w-full rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                          placeholder="City"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">
                          State / region
                        </span>
                        <input
                          type="text"
                          value={form.region}
                          onChange={(e) => updateField('region', e.target.value)}
                          className="w-full rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                          placeholder="State or province"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">
                          Country
                        </span>
                        <input
                          type="text"
                          value={form.country}
                          onChange={(e) => updateField('country', e.target.value)}
                          className="w-full rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                          placeholder="Country"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">
                          Postal code
                        </span>
                        <input
                          type="text"
                          value={form.postalCode}
                          onChange={(e) => updateField('postalCode', e.target.value)}
                          className="w-full rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                          placeholder="Postal / ZIP"
                        />
                      </label>
                    </div>

                    {error && (
                      <p className="rounded-sm bg-[#5C3A4B]/10 px-3 py-2 text-sm text-[#5C3A4B]">{error}</p>
                    )}
                    {saved && (
                      <p className="flex items-center gap-2 rounded-sm bg-[#6E7856]/15 px-3 py-2 text-sm text-[#6E7856]">
                        <CheckCircle2 size={16} /> Delivery location saved
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleSave('manual')}
                        className="inline-flex items-center gap-2 rounded-sm bg-[#2B2620] px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B] disabled:opacity-60 cursor-pointer"
                      >
                        <MapPin size={14} />
                        {mode === 'edit' ? 'Save changes' : 'Save location'}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleFindOnMap}
                        className="inline-flex items-center gap-2 rounded-sm border border-[#D9CFBB] bg-white px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-[#2B2620] hover:border-[#5C3A4B] disabled:opacity-60 cursor-pointer"
                      >
                        <Crosshair size={14} />
                        {loading ? 'Finding…' : 'Find on world map'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-[#6E6455]">
                        Click anywhere on the map to drop a pin. The short label updates to that place.
                      </p>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleUseMyLocation}
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-[#5C3A4B] hover:underline disabled:opacity-60 cursor-pointer"
                      >
                        <Navigation size={13} />
                        Use my location
                      </button>
                    </div>

                    <LocationMap
                      lat={form.lat === '' ? null : Number(form.lat)}
                      lng={form.lng === '' ? null : Number(form.lng)}
                      onPick={handleMapPick}
                      className="h-[360px] sm:h-[420px]"
                    />

                    {(form.lat !== '' || form.city || form.address) && (
                      <div className="rounded-sm border border-[#E7DFD0] bg-white px-4 py-3 text-sm text-[#4A443A]">
                        <p className="font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">Selected</p>
                        <p className="mt-1 font-medium text-[#2B2620]">
                          {form.label || [form.address, form.city, form.region, form.country].filter(Boolean).join(', ') || 'Map pin'}
                        </p>
                        {form.lat !== '' && form.lng !== '' && (
                          <p className="mt-1 font-mono text-[11px] text-[#9A9284]">
                            {Number(form.lat).toFixed(5)}, {Number(form.lng).toFixed(5)}
                          </p>
                        )}
                      </div>
                    )}

                    <label className="block max-w-sm">
                      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">
                        Short label
                      </span>
                      <input
                        type="text"
                        value={form.label}
                        onChange={(e) => updateField('label', e.target.value)}
                        className="w-full rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                        placeholder="Updates when you click the map"
                      />
                    </label>

                    {error && (
                      <p className="rounded-sm bg-[#5C3A4B]/10 px-3 py-2 text-sm text-[#5C3A4B]">{error}</p>
                    )}
                    {saved && (
                      <p className="flex items-center gap-2 rounded-sm bg-[#6E7856]/15 px-3 py-2 text-sm text-[#6E7856]">
                        <CheckCircle2 size={16} /> Delivery location saved
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={loading || (form.lat === '' && !form.city && !form.address)}
                      onClick={() => handleSave(form.lat !== '' ? 'map' : 'manual')}
                      className="inline-flex items-center gap-2 rounded-sm bg-[#2B2620] px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-[#EEE7D8] hover:bg-[#5C3A4B] disabled:opacity-60 cursor-pointer"
                    >
                      <MapPin size={14} />
                      {loading ? 'Looking up…' : mode === 'edit' ? 'Save changes' : 'Save map location'}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
