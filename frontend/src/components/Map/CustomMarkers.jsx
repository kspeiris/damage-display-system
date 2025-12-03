import React, { useState, useEffect, useCallback, useMemo } from 'react'
import L from 'leaflet'
import { Marker, Popup, useMap } from 'react-leaflet'
import { MarkerClusterGroup } from 'react-leaflet-markercluster'
import SeverityBadge from '../Damage/SeverityBadge'
import { 
  Building, 
  Home, 
  Factory, 
  Church, 
  School, 
  MapPin, 
  Flame, 
  Droplets, 
  Navigation, 
  Wrench, 
  Sprout, 
  Road,
  AlertTriangle,
  Clock,
  User,
  ExternalLink,
  Maximize2,
  Map as MapIcon,
  ChevronRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Install marker cluster: npm install react-leaflet-markercluster

// Create custom icons for different damage types with severity colors
export const createDamageIcon = (damage) => {
  const { severity, damageType } = damage
  const color = getSeverityColor(severity)
  const iconSvg = getDamageTypeIcon(damageType)
  
  const iconHtml = `
    <div class="leaflet-marker-icon-wrapper" style="
      position: relative;
      width: 48px;
      height: 48px;
      transition: all 0.3s ease;
    ">
      <!-- Outer glow for critical severity -->
      ${severity === 'critical' || severity === 'destroyed' ? `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 56px;
          height: 56px;
          background: ${color}40;
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
      ` : ''}
      
      <!-- Main marker -->
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 48px;
        height: 48px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        z-index: 10;
        transition: all 0.3s ease;
      ">
        ${iconSvg}
      </div>
      
      <!-- Severity indicator -->
      <div style="
        position: absolute;
        top: -2px;
        right: -2px;
        width: 16px;
        height: 16px;
        background: ${getSeverityIndicatorColor(severity)};
        border: 2px solid white;
        border-radius: 50%;
        z-index: 11;
      "></div>
    </div>
  `

  return L.divIcon({
    html: iconHtml,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
    className: 'custom-damage-marker'
  })
}

// Get SVG icon for damage type
const getDamageTypeIcon = (damageType) => {
  const icons = {
    structural: '🏠',
    flooding: '💧',
    landslide: '⛰️',
    fire: '🔥',
    road: '🛣️',
    utility: '⚡',
    agricultural: '🌾',
    residential: '🏠',
    commercial: '🏢',
    industrial: '🏭',
    religious: '🛐',
    public: '🏛️',
    default: '⚠️'
  }
  
  return icons[damageType] || icons.default
}

// Get color based on severity
const getSeverityColor = (severity) => {
  const colors = {
    minor: '#10b981',    // Green
    moderate: '#f59e0b', // Yellow
    severe: '#f97316',   // Orange
    critical: '#ef4444', // Red
    destroyed: '#8b5cf6' // Purple
  }
  return colors[severity] || '#6b7280'
}

// Get indicator color for severity dot
const getSeverityIndicatorColor = (severity) => {
  const colors = {
    minor: '#059669',
    moderate: '#d97706',
    severe: '#ea580c',
    critical: '#dc2626',
    destroyed: '#7c3aed'
  }
  return colors[severity] || '#4b5563'
}

// Get Lucide icon component for damage type
const getDamageTypeIconComponent = (damageType) => {
  const iconMap = {
    structural: Building,
    flooding: Droplets,
    landslide: Navigation,
    fire: Flame,
    road: Road,
    utility: Wrench,
    agricultural: Sprout,
    residential: Home,
    commercial: Building,
    industrial: Factory,
    religious: Church,
    public: School
  }
  return iconMap[damageType] || AlertTriangle
}

// Custom marker with animation
const CustomMarker = ({ damage, onClick, isSelected }) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const map = useMap()
  const IconComponent = getDamageTypeIconComponent(damage.damageType || damage.propertyType)

  const icon = useMemo(() => createDamageIcon(damage), [damage])

  // Handle click animation
  const handleClick = useCallback((e) => {
    setIsAnimating(true)
    
    // Fly to marker
    map.flyTo([damage.location.latitude, damage.location.longitude], 15, {
      duration: 1
    })
    
    // Trigger onClick callback
    if (onClick) {
      onClick(damage)
    }
    
    // Reset animation
    setTimeout(() => setIsAnimating(false), 300)
  }, [damage, map, onClick])

  // Bounce animation when selected
  useEffect(() => {
    if (isSelected && !isAnimating) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
    }
  }, [isSelected, isAnimating])

  return (
    <Marker
      position={[damage.location.latitude, damage.location.longitude]}
      icon={icon}
      eventHandlers={{
        click: handleClick,
        mouseover: (e) => {
          e.target.openPopup()
        },
        mouseout: (e) => {
          e.target.closePopup()
        }
      }}
    >
      <Popup minWidth={300} maxWidth={400}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: getSeverityColor(damage.severity) + '20' }}>
                <IconComponent className="h-5 w-5" style={{ color: getSeverityColor(damage.severity) }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg capitalize">
                  {damage.propertyType} Damage
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {damage.damageType || 'Unknown type'}
                </p>
              </div>
            </div>
            <SeverityBadge severity={damage.severity} size="small" />
          </div>

          {/* Photo Preview */}
          {damage.photos && damage.photos.length > 0 && (
            <div className="mb-4 relative">
              <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={damage.photos[0]?.url || damage.photos[0]}
                  alt="Damage"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {damage.photos.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  +{damage.photos.length - 1}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-gray-700 mb-4 line-clamp-3 text-sm">
            {damage.description || 'No description provided'}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">
                  {damage.createdAt ? formatDistanceToNow(new Date(damage.createdAt), { addSuffix: true }) : 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">Reported</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">
                  {damage.reportedBy?.name || 'Anonymous'}
                </div>
                <div className="text-xs text-gray-500">Reporter</div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-gray-900">Location</div>
                <div className="text-gray-600 mt-0.5">
                  {damage.location?.address || damage.address || 'Location not specified'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {damage.location?.latitude?.toFixed(4)}, {damage.location?.longitude?.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={() => window.open(`/reports/${damage._id || damage.id}`, '_blank')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Details
            </button>
            <button
              onClick={handleClick}
              className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

// Cluster icon customization
const createClusterIcon = (cluster) => {
  const childCount = cluster.getChildCount()
  let color = '#6b7280'
  let size = 40
  
  // Adjust color based on average severity in cluster
  const markers = cluster.getAllChildMarkers()
  const severities = markers.map(m => m.options.damage?.severity)
  
  if (severities.includes('critical') || severities.includes('destroyed')) {
    color = '#ef4444'
    size = 50
  } else if (severities.includes('severe')) {
    color = '#f97316'
    size = 45
  } else if (severities.includes('moderate')) {
    color = '#f59e0b'
    size = 42
  }
  
  const iconHtml = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${childCount > 99 ? '14px' : '16px'};
      transition: all 0.3s ease;
    ">
      ${childCount}
    </div>
  `

  return L.divIcon({
    html: iconHtml,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: 'cluster-marker'
  })
}

// Main component with clustering
const CustomMarkers = ({ damages, onMarkerClick, selectedDamageId }) => {
  const [clustered, setClustered] = useState(true)

  // Split into individual markers and clusters
  const individualMarkers = damages.slice(0, 50) // Show first 50 as individual
  const clusterMarkers = damages.slice(50) // Rest as clusters

  return (
    <>
      {/* Individual markers for better visibility */}
      {!clustered && damages.map(damage => (
        <CustomMarker
          key={damage._id || damage.id}
          damage={damage}
          onClick={onMarkerClick}
          isSelected={selectedDamageId === (damage._id || damage.id)}
        />
      ))}

      {/* Clustered markers for performance */}
      {clustered && (
        <MarkerClusterGroup
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          spiderfyOnMaxZoom={true}
          removeOutsideVisibleBounds={true}
          animate={true}
          animateAddingMarkers={true}
          maxClusterRadius={60}
          iconCreateFunction={createClusterIcon}
          chunkedLoading={true}
        >
          {damages.map(damage => (
            <CustomMarker
              key={damage._id || damage.id}
              damage={damage}
              onClick={onMarkerClick}
              isSelected={selectedDamageId === (damage._id || damage.id)}
            />
          ))}
        </MarkerClusterGroup>
      )}

      {/* Cluster Toggle */}
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control leaflet-bar">
          <button
            onClick={() => setClustered(!clustered)}
            className="bg-white px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors text-sm font-medium"
            title={clustered ? "Show individual markers" : "Cluster markers"}
          >
            {clustered ? '📊 Clustered' : '📍 Individual'}
          </button>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
            50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.3; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.2); }
          }
          
          .custom-marker.leaflet-interactive {
            transition: transform 0.3s ease;
          }
          
          .custom-marker.leaflet-interactive:hover {
            transform: scale(1.1);
            z-index: 1000 !important;
          }
          
          .leaflet-marker-icon-wrapper {
            animation: ${isAnimating => isAnimating ? 'bounce 0.6s ease' : 'none'};
          }
          
          .cluster-marker {
            transition: all 0.3s ease;
          }
          
          .cluster-marker:hover {
            transform: scale(1.1);
            z-index: 1000;
          }
        `}
      </style>
    </>
  )
}

export default CustomMarkers