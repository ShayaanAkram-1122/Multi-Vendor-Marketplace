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

function buildLabel(parts) {
  const { label, address, city, country } = parts
  if (label?.trim()) return label.trim()
  return placeShortLabel(parts) || address || country || 'Saved location'
}

/** Always derive a short label from place fields (ignores any previous custom label). */
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
  const { deliveryLocation, saveDeliveryLocation, clearDeliveryLocation } = useShopActivity()
  const [tab, setTab] = useState('manual')
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!deliveryLocation) return
    setForm({
      label: deliveryLocation.label || '',
      address: deliveryLocation.address || '',
      city: deliveryLocation.city || '',
      region: deliveryLocation.region || '',
      country: deliveryLocation.country || '',
      postalCode: deliveryLocation.postalCode || '',
      lat: deliveryLocation.lat ?? '',
      lng: deliveryLocation.lng ?? '',
    })
  }, [deliveryLocation])

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
      setForm({
        ...EMPTY_FORM,
        ...found,
        label: placeShortLabel(found),
        lat,
        lng,
      })
    } catch (err) {
      setForm((prev) => ({ ...prev, lat, lng }))
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
      setForm((prev) => ({
        ...prev,
        ...found,
        label: placeShortLabel(found),
      }))
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
  }

  const handleClear = () => {
    clearDeliveryLocation()
    setForm(EMPTY_FORM)
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
              Enter an address yourself, or drop a pin on the world map. You can also find a typed address on the map.
            </p>
          </div>

          {deliveryLocation && (
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D9CFBB] bg-[#EEE7D8]/50 px-5 py-4">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#5C3A4B]" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-[#9A9284]">Current</p>
                  <p className="text-sm font-medium text-[#2B2620]">
                    {deliveryLocation.label || buildLabel(deliveryLocation)}
                  </p>
                  <p className="mt-0.5 text-sm text-[#6E6455]">
                    {[deliveryLocation.address, deliveryLocation.city, deliveryLocation.region, deliveryLocation.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-[#5C3A4B] hover:underline cursor-pointer"
              >
                <Trash2 size={13} /> Clear
              </button>
            </div>
          )}

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
                      placeholder="Home, Office, Parents…"
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
                    Save location
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
                    Click anywhere on the map to drop a pin. We’ll fill in the nearest address.
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
                      {[form.address, form.city, form.region, form.country].filter(Boolean).join(', ') || 'Map pin'}
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
                    Short label (optional)
                  </span>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => updateField('label', e.target.value)}
                    className="w-full rounded-sm border border-[#D9CFBB] bg-white px-3 py-2 text-sm text-[#2B2620] outline-none focus:border-[#5C3A4B]"
                    placeholder="Home, Office…"
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
                  {loading ? 'Looking up…' : 'Save map location'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
