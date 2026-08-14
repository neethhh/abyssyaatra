import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const location = new URL(request.url).searchParams.get('location')?.trim()
  if (!location) return NextResponse.json({ error: 'A beach location is required.' }, { status: 400 })

  const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location.replace(/ Beach.*/, ''))}&count=10&language=en&format=json&countryCode=IN`, { next: { revalidate: 86400 } })
  if (!geo.ok) return NextResponse.json({ error: 'Weather location lookup failed.' }, { status: 502 })
  const places = (await geo.json())?.results ?? []
  const place = places.find((item: { country_code?: string }) => item.country_code === 'IN') ?? places[0]
  if (!place) return NextResponse.json({ error: 'No weather location found.' }, { status: 404 })

  const forecast = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`, { next: { revalidate: 900 } })
  if (!forecast.ok) return NextResponse.json({ error: 'Weather forecast request failed.' }, { status: 502 })
  const data = await forecast.json()
  const labels: Record<number, string> = { 0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Foggy', 51: 'Light drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 80: 'Rain showers', 95: 'Thunderstorms' }
  return NextResponse.json({ configured: true, provider: 'Open-Meteo', location: place.name, forecasts: (data.daily?.time ?? []).map((date: string, index: number) => ({ date, min: data.daily.temperature_2m_min[index], max: data.daily.temperature_2m_max[index], text: labels[data.daily.weather_code[index]] ?? 'Variable conditions', rain: data.daily.precipitation_probability_max[index] ?? 0 })) })
}
