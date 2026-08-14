import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const location = new URL(request.url).searchParams.get('location')?.trim()
  const apiKey = process.env.ACCUWEATHER_API_KEY

  if (!location) return NextResponse.json({ error: 'A beach location is required.' }, { status: 400 })
  if (!apiKey) return NextResponse.json({ configured: false, message: 'Add ACCUWEATHER_API_KEY to enable live AccuWeather forecasts.' })

  const base = 'https://dataservice.accuweather.com'
  const search = await fetch(`${base}/locations/v1/cities/search?apikey=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(`${location}, India`)}`, { next: { revalidate: 900 } })
  if (!search.ok) return NextResponse.json({ error: 'AccuWeather location search failed.' }, { status: 502 })
  const matches = await search.json()
  const key = matches?.[0]?.Key
  if (!key) return NextResponse.json({ error: 'No AccuWeather location found.' }, { status: 404 })

  const forecast = await fetch(`${base}/forecasts/v1/daily/5day/${key}?apikey=${encodeURIComponent(apiKey)}&metric=true&details=true`, { next: { revalidate: 900 } })
  if (!forecast.ok) return NextResponse.json({ error: 'AccuWeather forecast request failed.' }, { status: 502 })
  const data = await forecast.json()
  return NextResponse.json({ configured: true, location: matches[0].LocalizedName, forecasts: (data.DailyForecasts ?? []).map((day: any) => ({ date: day.Date, min: day.Temperature?.Minimum?.Value, max: day.Temperature?.Maximum?.Value, text: day.Day?.IconPhrase, rain: day.Day?.PrecipitationProbability })) })
}
