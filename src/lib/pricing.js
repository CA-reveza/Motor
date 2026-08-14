// Vehicle catalog: mirrors Porter's mixed two-wheeler / mini-truck lineup.
export const VEHICLE_TYPES = [
  { id: 'bike', label: 'Two-Wheeler', desc: 'Small parcels, documents', capacityKg: 20, base: 30, perKm: 6 },
  { id: 'three_wheeler', label: '3-Wheeler', desc: 'Small loads, tight lanes', capacityKg: 300, base: 60, perKm: 11 },
  { id: 'pickup', label: 'Pickup Truck', desc: 'Furniture, appliances', capacityKg: 750, base: 120, perKm: 16 },
  { id: 'mini_truck', label: 'Mini Truck', desc: 'Bulk goods, house shift', capacityKg: 1500, base: 220, perKm: 22 },
  { id: 'large_truck', label: 'Large Truck', desc: 'Full house / commercial', capacityKg: 5000, base: 450, perKm: 34 },
]

export function vehicleById(id) {
  return VEHICLE_TYPES.find((v) => v.id === id)
}

// Straight-line distance in km between two lat/lng points (Haversine).
export function distanceKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function estimateFare(vehicleTypeId, km) {
  const v = vehicleById(vehicleTypeId)
  if (!v) return 0
  return Math.round(v.base + v.perKm * Math.max(km, 1))
}
