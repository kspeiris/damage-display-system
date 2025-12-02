import React from 'react'
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import SeverityBadge from '../Damage/SeverityBadge'
import { formatDate } from '../../utils/formatters'

// Create custom icons for different severity levels
export const createSeverityIcon = (severity) => {
  const iconHtml = `
    <div style="
      width: 40px;
      height: 40px;
      background: ${getSeverityColor(severity)};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">
      ${getSeverityInitial(severity)}
    </div>
  `

  return L.divIcon({
    html: iconHtml,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'custom-marker'
  })
}

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'minor': return '#10b981'
    case 'moderate': return '#f59e0b'
    case 'severe': return '#f97316'
    case 'destroyed': return '#ef4444'
    default: return '#6b7280'
  }
}

const getSeverityInitial = (severity) => {
  switch (severity) {
    case 'minor': return 'M'
    case 'moderate': return 'MD'
    case 'severe': return 'S'
    case 'destroyed': return 'D'
    default: return '?'
  }
}

const CustomMarker = ({ damage, onClick }) => {
  const icon = createSeverityIcon(damage.severity)

  return (
    <Marker
      position={[damage.location.latitude, damage.location.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onClick?.(damage)
      }}
    >
      <Popup>
        <div className="min-w-[250px] p-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 capitalize text-lg">
              {damage.propertyType}
            </h3>
            <SeverityBadge severity={damage.severity} />
          </div>
          
          {damage.photos && damage.photos.length > 0 && (
            <div className="mb-3">
              <img
                src={damage.photos[0]}
                alt="Damage"
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
          )}
          
          <p className="text-gray-700 mb-3 line-clamp-3">
            {damage.description}
          </p>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium mr-2">Location:</span>
              <span>{damage.location.address || 'Not specified'}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">Reported:</span>
              <span>{formatDate(damage.createdAt)}</span>
            </div>
            {damage.verificationStatus === 'verified' && (
              <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                ✓ Verified
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

export default CustomMarker