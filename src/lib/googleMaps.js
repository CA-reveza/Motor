// Loads the Google Maps JS API once and caches the promise, so multiple
// components mounting Autocomplete don't each inject their own <script> tag.
let loadPromise = null

export function loadGoogleMaps() {
  if (loadPromise) return loadPromise

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return Promise.reject(
      new Error('Missing VITE_GOOGLE_MAPS_API_KEY — copy .env.example to .env and add a Google Maps key.')
    )
  }

  loadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google.maps)
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`
    script.async = true
    script.onload = () => resolve(window.google.maps)
    script.onerror = () => reject(new Error('Failed to load Google Maps script.'))
    document.head.appendChild(script)
  })

  return loadPromise
}

// Static Maps thumbnail URL — no JS needed, just an <img src>.
export function staticMapUrl({ pickup, drop, width = 640, height = 240 }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey || !pickup || !drop) return null
  const params = new URLSearchParams({
    size: `${width}x${height}`,
    key: apiKey,
    markers: `color:0xf4c531|label:A|${pickup.lat},${pickup.lng}`,
  })
  params.append('markers', `color:0xff7a1a|label:B|${drop.lat},${drop.lng}`)
  params.append('path', `color:0xff7a1a80|weight:3|${pickup.lat},${pickup.lng}|${drop.lat},${drop.lng}`)
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`
}

export function directionsUrl({ pickup, drop }) {
  if (!pickup || !drop) return null
  return `https://www.google.com/maps/dir/?api=1&origin=${pickup.lat},${pickup.lng}&destination=${drop.lat},${drop.lng}`
}
