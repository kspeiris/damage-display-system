import React, { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import { useDamage } from '../context/DamageContext'
import DamageFilters from '../components/Damage/DamageFilters'
import ReportDamageModal from '../components/Damage/ReportDamageModal'
import SeverityBadge from '../components/Damage/SeverityBadge'
import { Plus, Filter, Navigation, Image as ImageIcon } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom severity icons
const severityIcons = {
  minor: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  moderate: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  severe: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  destroyed: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  unknown: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
}

// Helper function to get photo URL
const getPhotoUrl = (photo) => {
  if (!photo) return null
  // New format: { url: "...", publicId: "..." }
  if (typeof photo === 'object' && photo.url) {
    return photo.url
  }
  // Old format: string URL
  if (typeof photo === 'string') {
    return photo
  }
  return null
}

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null)

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onLocationSelect(e.latlng)
    },
  })

  return position ? (
    <Marker position={position} icon={severityIcons.moderate} />
  ) : null
}

const MapView = () => {
  const { damages, mapView, filters } = useDamage()
  const [showFilters, setShowFilters] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handleLocationSelect = useCallback((latlng) => {
    setSelectedLocation(latlng)
    setShowReportModal(true)
  }, [])

  // Filter damages and ensure they have valid coordinates
  const filteredDamages = damages.filter(damage => {
    if (!damage) return false
    
    // Apply filters
    if (filters.severity !== 'all' && damage.severity !== filters.severity) return false
    if (filters.propertyType !== 'all' && damage.propertyType !== filters.propertyType) return false
    
    // Check if damage has valid coordinates
    const lat = damage.location?.latitude
    const lng = damage.location?.longitude
    
    if (lat == null || lng == null) {
      console.warn('⚠️ Damage missing coordinates:', damage._id)
      return false
    }
    
    if (isNaN(lat) || isNaN(lng)) {
      console.warn('⚠️ Damage has invalid coordinates:', damage._id, lat, lng)
      return false
    }
    
    return true
  })

  console.log('🗺️ MapView - Total damages:', damages.length)
  console.log('🗺️ MapView - Filtered damages:', filteredDamages.length)

  return (
    <div className="h-screen flex flex-col">
      {/* Map Controls */}
      <div className="absolute top-20 left-4 z-[1000] space-y-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <Filter className="h-5 w-5 text-gray-600" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowReportModal(true)}
          className="bg-blue-500 text-white p-3 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute top-20 left-16 z-[999] bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80"
          >
            <DamageFilters />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapView.center}
          zoom={mapView.zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <LocationMarker onLocationSelect={handleLocationSelect} />
          
          {filteredDamages.map((damage, index) => {
            const lat = damage.location?.latitude
            const lng = damage.location?.longitude
            
            if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
              console.error('❌ Invalid coordinates:', damage._id, lat, lng)
              return null
            }
            
            const severity = damage.severity || 'moderate'
            const icon = severityIcons[severity] || severityIcons.moderate
            
            // Get photo URL
            const firstPhoto = damage.photos?.[0]
            const photoUrl = getPhotoUrl(firstPhoto)
            
            return (
              <Marker
                key={damage._id || `damage-${index}`}
                position={[lat, lng]}
                icon={icon}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {damage.propertyType || 'Unknown Property'}
                      </h3>
                      <SeverityBadge severity={severity} />
                    </div>
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Damage"
                        className="w-full h-32 object-cover rounded mb-2"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU1RTUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjQkJCQkJCIi8+PHBhdGggZD0iTTEyNSAxMDBMNzUgMTUwTTc1IDUwTDEyNSAxMDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+`
                        }}
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mb-2">
                      {damage.description || 'No description'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {damage.location?.address || 'No address provided'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {damage.createdAt 
                        ? new Date(damage.createdAt).toLocaleDateString()
                        : 'Unknown date'
                      }
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Report Damage Modal */}
      <ReportDamageModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false)
          setSelectedLocation(null)
        }}
        initialLocation={selectedLocation}
      />
    </div>
  )
}

export default MapView