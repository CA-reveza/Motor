// Mappls (mappls.com) REST APIs. Unlike Google, these are plain fetch calls
// with a static "access_token" key — no JS SDK script tag and no OAuth
// exchange needed for these three endpoints. Get a REST API key from the
// Mappls Console and whitelist your domain (and localhost for dev) against it.
//
// Careful: different Mappls endpoints use different coordinate orders.
// Autosuggest / Static Map take "lat,lng". Distance Matrix takes "lng,lat".
// Each function below converts internally so callers always pass
// { lat, lng } and never have to think about it.

const KEY = import.meta.env.VITE_MAPPLS_API_KEY

// Autosuggest and Distance Matrix are called with fetch(), which enforces
// CORS — and Mappls doesn't send CORS headers on these by default. Going
// through the Vite dev proxy (see vite.config.js) keeps the browser's
// request same-origin.
const SEARCH_BASE = import.meta.env.DEV ? '/mappls/search' : 'https://search.mappls.com'
const ROUTE_BASE = import.meta.env.DEV ? '/mappls/route' : 'https://route.mappls.com'

function requireKey() {
  if (!KEY) {
    throw new Error(
      'Missing VITE_MAPPLS_API_KEY — copy .env.example to .env and add your Mappls REST API key.'
    )
  }
}

export async function suggestAddresses(query, near) {
  requireKey()
  if (!query || query.trim().length < 3) return []

  const params = new URLSearchParams({ query, access_token: KEY })
  if (near) params.set('location', `${near.lat},${near.lng}`)

  const res = await fetch(`${SEARCH_BASE}/search/places/autosuggest/json?${params}`)
  if (!res.ok) throw new Error(`Mappls autosuggest failed: ${res.status}`)
  const data = await res.json()

  return (data.suggestedLocations || [])
    .filter((p) => p.latitude && p.longitude)
    .map((p) => ({
      address: p.placeAddress || p.placeName,
      lat: parseFloat(p.latitude),
      lng: parseFloat(p.longitude),
      eLoc: p.eLoc,
    }))
}

export async function drivingDistanceKm(pickup, drop) {
  requireKey()
  const origin = `${pickup.lng},${pickup.lat}`
  const dest = `${drop.lng},${drop.lat}`
  const url = `${ROUTE_BASE}/route/dm/distance_matrix/driving/${origin};${dest}?access_token=${KEY}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Mappls distance matrix failed: ${res.status}`)
  const data = await res.json()

  const meters = data.results?.distances?.[0]?.[1]
  if (typeof meters !== 'number') throw new Error('Mappls distance matrix returned no route.')
  return meters / 1000
}

export function staticMapUrl({ pickup, drop, width = 640, height = 240 }) {
  if (!KEY || !pickup || !drop) return null
  const centerLat = (pickup.lat + drop.lat) / 2
  const centerLng = (pickup.lng + drop.lng) / 2
  const params = new URLSearchParams({
    center: `${centerLat},${centerLng}`,
    zoom: '11',
    size: `${width}x${height}`,
    access_token: KEY,
  })
  params.append('markers', `${pickup.lat},${pickup.lng}`)
  params.append('markers', `${drop.lat},${drop.lng}`)
  return `https://tile.mappls.com/map/raster_tile/still_image?${params.toString()}`
}

export function directionsUrl({ pickup, drop }) {
  if (!pickup || !drop) return null
  return `https://mappls.com/direction?places=${pickup.lat},${pickup.lng};${drop.lat},${drop.lng}`
}