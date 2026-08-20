'use client'

import { useState } from 'react'
import { ExternalLink, Hotel, LocateFixed, MapPin, Star } from 'lucide-react'

type LocationState = 'idle' | 'loading' | 'ready' | 'denied' | 'unavailable'

const fallbackSearch = 'hotels near Mandvi Beach Gujarat'

export function NearbyStays() {
  const [status, setStatus] = useState<LocationState>('idle')
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus('unavailable')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({ latitude: coords.latitude, longitude: coords.longitude })
        setStatus('ready')
      },
      ({ code }) => setStatus(code === 1 ? 'denied' : 'unavailable'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  const nearbyUrl = coordinates
    ? `https://www.google.com/maps/search/hotels/@${coordinates.latitude},${coordinates.longitude},13z`
    : `https://www.google.com/maps/search/${encodeURIComponent(fallbackSearch)}`

  const cards = coordinates
    ? [
        ['Hotels near you', 'Open Google Maps to compare live nearby options', 'Location-based search'],
        ['Stay near your route', 'Use ratings, availability and directions from Google Maps', 'Live availability'],
        ['Explore local stays', 'Search boutique stays, resorts and guesthouses nearby', 'Local options'],
      ]
    : [
        ['Hotels near Mandvi Beach', 'Compare live availability, reviews and directions', 'Beach fallback'],
        ['Resorts near Mandvi Beach', 'Browse stays with coastal access and guest services', 'Beach fallback'],
        ['Guesthouses near Mandvi Beach', 'Find local stays and independent hosts nearby', 'Beach fallback'],
      ]

  return <section id="stays" className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Sleep well by the sea</p><h2 className="section-title">Stays near your current location</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">We use your browser location only to center a live Google Maps hotel search. We do not save your coordinates.</p></div><button type="button" onClick={requestLocation} disabled={status === 'loading'} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"><LocateFixed size={16}/>{status === 'loading' ? 'Finding you…' : status === 'ready' ? 'Location updated' : 'Use my location'}</button></div>{status === 'denied' || status === 'unavailable' ? <p role="status" className="mt-4 text-sm text-muted-foreground">{status === 'denied' ? 'Location permission was denied. Showing a beach search fallback instead.' : 'Your location is unavailable. Showing a beach search fallback instead.'}</p> : null}<div className="mt-8 grid gap-4 md:grid-cols-3">{cards.map(([name, detail, label]) => <div key={name} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Hotel size={20}/></span><span className="flex items-center gap-1 text-sm font-bold"><Star size={14} fill="currentColor" className="text-primary"/>Google</span></div><h3 className="mt-5 font-serif text-xl font-bold">{name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin size={14}/>{label}</p><p className="mt-4 border-t border-border pt-4 text-sm leading-6">{detail}</p><a href={nearbyUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">View live hotel search <ExternalLink size={14}/></a></div>)}</div></section>
}
