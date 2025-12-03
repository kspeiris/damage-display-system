import React, { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import { useDamage } from '../context/DamageContext'
import DamageFilters from '../components/Damage/DamageFilters'
import ReportDamageModal from '../components/Damage/ReportDamageModal'
import SeverityBadge from '../components/Damage/SeverityBadge'
import MapControls from '../components/Map/MapControls'
import { 
  Plus, 
  Filter, 
  ChevronRight, 
  ChevronLeft,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertCircle,
  Home,
  Building,
  Shield,
  X,
  Clock,
  AlertTriangle
} from 'lucide-react'
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
  if (typeof photo === 'object' && photo.url) {
    return photo.url
  }
  if (typeof photo === 'string') {
    return photo
  }
  return null
}

// Skeleton loader for map markers
const MarkerSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-full h-10 w-10"></div>
  </div>
)

// Skeleton loader for damage cards
const DamageCardSkeleton = () => (
  <div className="animate-pulse bg-white rounded-lg p-3 mb-3 border border-gray-200">
    <div className="flex items-start justify-between mb-2">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="h-6 w-16 bg-gray-200 rounded"></div>
    </div>
    <div className="h-20 bg-gray-200 rounded mb-2"></div>
    <div className="flex items-center justify-between">
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
)

function LocationMarker({ onLocationSelect, isLoading }) {
  const [position, setPosition] = useState(null)
  const map = useMap()

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onLocationSelect(e.latlng)
    },
  })

  if (isLoading) {
    return null
  }

  return position ? (
    <Marker position={position} icon={severityIcons.moderate} />
  ) : null
}

// Fullscreen control component
function FullscreenControl() {
  const map = useMap()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    const elem = map.getContainer()
    
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <button
      onClick={toggleFullscreen}
      className="bg-white p-2 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow absolute bottom-20 right-4 z-[1000]"
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? (
        <Minimize2 className="h-4 w-4 text-gray-600" />
      ) : (
        <Maximize2 className="h-4 w-4 text-gray-600" />
      )}
    </button>
  )
}

const MapView = () => {
  const { damages, mapView, filters, refreshDamages, isLoading } = useDamage()
  const [showFilters, setShowFilters] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [mapType, setMapType] = useState('normal')
  const [severityFilters, setSeverityFilters] = useState(['minor', 'moderate', 'severe', 'destroyed', 'unknown'])
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const mapRef = React.useRef(null)

  useEffect(() => {
    let intervalId
    if (autoRefresh) {
      intervalId = setInterval(() => {
        refreshDamages()
        setLastRefresh(new Date())
      }, 30000) // Refresh every 30 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [autoRefresh, refreshDamages])

  const handleLocationSelect = useCallback((latlng) => {
    setSelectedLocation(latlng)
    setShowReportModal(true)
  }, [])

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut()
    }
  }

  const handleResetZoom = () => {
    if (mapRef.current) {
      mapRef.current.setView(mapView.center, mapView.zoom)
    }
  }

  const handleLocate = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          mapRef.current.setView([latitude, longitude], 15)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please check location permissions.')
        }
      )
    }
  }

  const handleToggleLayers = () => {
    setShowHeatmap(!showHeatmap)
  }

  const handleToggleMapType = () => {
    setMapType(mapType === 'normal' ? 'satellite' : 'normal')
  }

  const handleSeverityFilter = (filters) => {
    setSeverityFilters(filters)
  }

  const filteredDamages = damages.filter(damage => {
    if (!damage) return false
    
    // Apply existing filters
    if (filters.severity !== 'all' && damage.severity !== filters.severity) return false
    if (filters.propertyType !== 'all' && damage.propertyType !== filters.propertyType) return false
    
    // Apply severity filters
    if (!severityFilters.includes(damage.severity)) return false
    
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

  // Calculate summary statistics
  const summaryStats = {
    total: filteredDamages.length,
    bySeverity: filteredDamages.reduce((acc, damage) => {
      acc[damage.severity] = (acc[damage.severity] || 0) + 1
      return acc
    }, {}),
    byPropertyType: filteredDamages.reduce((acc, damage) => {
      acc[damage.propertyType] = (acc[damage.propertyType] || 0) + 1
      return acc
    }, {})
  }

  // Get top damages for side panel (most recent)
  const topDamages = filteredDamages
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="h-screen flex flex-col relative">
      {/* Collapsible Side Panel */}
      <motion.div
        initial={false}
        animate={{ x: isCollapsed ? -350 : 0 }}
        className="absolute left-0 top-0 bottom-0 z-[1000] bg-white shadow-xl border-r border-gray-200"
        style={{ width: '350px' }}
      >
        <div className="h-full flex flex-col">
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">Damage Reports</h2>
              <p className="text-sm text-gray-500">{filteredDamages.length} reports visible</p>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Auto-refresh toggle */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-blue-500 animate-spin' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">Auto-refresh</span>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${autoRefresh ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${autoRefresh ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {/* Last refresh time */}
            <div className="mb-4 text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Last refreshed: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            {/* Damage Cards */}
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <DamageCardSkeleton key={i} />
              ))
            ) : topDamages.length > 0 ? (
              topDamages.map((damage, index) => (
                <motion.div
                  key={damage._id || `damage-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-3 mb-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (mapRef.current) {
                      const lat = damage.location?.latitude
                      const lng = damage.location?.longitude
                      if (lat && lng) {
                        mapRef.current.setView([lat, lng], 15)
                      }
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {damage.propertyType || 'Unknown Property'}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {damage.location?.address || 'No address'}
                      </p>
                    </div>
                    <SeverityBadge severity={damage.severity} />
                  </div>
                  
                  {damage.photos?.[0] && (
                    <img
                      src={getPhotoUrl(damage.photos[0])}
                      alt="Damage"
                      className="w-full h-32 object-cover rounded mb-2"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU1RTUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjQkJCQkJCIi8+PHBhdGggZD0iTTEyNSAxMDBMNzUgMTUwTTc1IDUwTDEyNSAxMDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+`
                      }}
                    />
                  )}
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {damage.description || 'No description'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {damage.createdAt 
                        ? new Date(damage.createdAt).toLocaleDateString()
                        : 'Unknown date'
                      }
                    </span>
                    <span className="flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Priority: {damage.severity}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No damage reports found</p>
                <p className="text-sm mt-1">Adjust filters or report new damage</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-0' : 'ml-0 md:ml-[350px]'}`}>
        {/* Top Controls */}
        <div className="absolute top-4 left-4 z-[1000] space-y-2">
          {!isCollapsed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCollapsed(true)}
              className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </motion.button>
          )}
          
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <DamageFilters />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Container */}
        <div className="h-full relative">
          {isLoading ? (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading map data...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={mapView.center}
              zoom={mapView.zoom}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              whenCreated={(map) => {
                mapRef.current = map
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={mapType === 'satellite' 
                  ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
              />
              
              <LocationMarker onLocationSelect={handleLocationSelect} isLoading={isLoading} />
              
              {filteredDamages.map((damage, index) => {
                const lat = damage.location?.latitude
                const lng = damage.location?.longitude
                
                if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
                  return null
                }
                
                const severity = damage.severity || 'moderate'
                const icon = severityIcons[severity] || severityIcons.moderate
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
                              e.target.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiVFNUU1RTUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjQkJCQkJCIi8+PHBhdGggZD0iTTEyNSAxMDBMNzUgMTUwTTc1IDUwTDEyNSAxMDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+`
                            }}
                          />
                        ) : null}
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
              
              <FullscreenControl />
            </MapContainer>
          )}
        </div>

        {/* Map Controls Component */}
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onLocate={handleLocate}
          onToggleLayers={handleToggleLayers}
          onToggleMapType={handleToggleMapType}
          onSeverityFilter={handleSeverityFilter}
          currentMapType={mapType}
          showHeatmap={showHeatmap}
          severityFilters={severityFilters}
        />

        {/* Bottom Summary Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-sm border-t border-gray-200">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="bg-blue-500 text-white rounded-full p-2 mr-3">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Reports</p>
                    <p className="font-semibold">{summaryStats.total}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Minor: {summaryStats.bySeverity.minor || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm">Moderate: {summaryStats.bySeverity.moderate || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-sm">Severe: {summaryStats.bySeverity.severe || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm">Destroyed: {summaryStats.bySeverity.destroyed || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Home className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">Residential: {summaryStats.byPropertyType.residential || 0}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">Commercial: {summaryStats.byPropertyType.commercial || 0}</span>
                </div>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="text-blue-500 hover:text-blue-600 font-medium text-sm"
                >
                  {isCollapsed ? 'Show Details →' : 'Hide Sidebar ←'}
                </button>
              </div>
            </div>
          </div>
        </div>
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