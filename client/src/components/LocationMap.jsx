import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick?.(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapRecenter({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return
    map.setView([lat, lng], Math.max(map.getZoom(), 12), { animate: true })
  }, [lat, lng, map])
  return null
}

export default function LocationMap({ lat, lng, onPick, className = '' }) {
  const hasPin = lat != null && lng != null && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
  const center = hasPin ? [Number(lat), Number(lng)] : [20, 0]
  const zoom = hasPin ? 13 : 2

  return (
    <div className={`overflow-hidden rounded-sm border border-[#D9CFBB] ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full min-h-[280px]"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPick={onPick} />
        <MapRecenter lat={hasPin ? Number(lat) : null} lng={hasPin ? Number(lng) : null} />
        {hasPin && <Marker position={[Number(lat), Number(lng)]} />}
      </MapContainer>
    </div>
  )
}
