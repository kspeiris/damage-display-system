import L from 'leaflet'

export const calculateBounds = (locations) => {
  if (!locations || locations.length === 0) {
    return L.latLngBounds([6.0, 79.0], [10.0, 82.0]) // Sri Lanka bounds
  }

  const bounds = L.latLngBounds(
    locations.map(loc => [loc.latitude, loc.longitude])
  )
  return bounds
}

export const getClusterColor = (count) => {
  if (count >= 100) return '#dc2626' // Red
  if (count >= 50) return '#f97316'  // Orange
  if (count >= 20) return '#f59e0b'  // Yellow
  if (count >= 10) return '#10b981'  // Green
  return '#3b82f6' // Blue
}

export const createHeatmapLayer = (damages) => {
  const points = damages.map(damage => {
    const weight = getSeverityWeight(damage.severity)
    return [damage.location.latitude, damage.location.longitude, weight]
  })

  return {
    points,
    options: {
      radius: 25,
      maxOpacity: 0.8,
      scaleRadius: true,
      useLocalExtrema: false,
      latField: 'lat',
      lngField: 'lng',
      valueField: 'count',
      gradient: {
        0.1: '#10b981', // Green
        0.3: '#f59e0b', // Yellow
        0.5: '#f97316', // Orange
        0.8: '#ef4444'  // Red
      }
    }
  }
}

const getSeverityWeight = (severity) => {
  switch (severity) {
    case 'minor': return 1
    case 'moderate': return 2
    case 'severe': return 3
    case 'destroyed': return 4
    default: return 1
  }
}

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export const findNearestDamages = (location, damages, maxDistance = 10) => {
  return damages.filter(damage => {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      damage.location.latitude,
      damage.location.longitude
    )
    return distance <= maxDistance
  })
}