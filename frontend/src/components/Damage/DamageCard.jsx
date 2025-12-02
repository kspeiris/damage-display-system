import React from 'react'
import { MapPin, Calendar, AlertCircle, ExternalLink } from 'lucide-react'
import SeverityBadge from './SeverityBadge'
import { useNavigate } from 'react-router-dom'

const DamageCard = ({ damage, viewMode = 'grid', onViewDetails }) => {
  const navigate = useNavigate()

  // ✅ FIX: Handle missing damage data
  if (!damage) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 border border-gray-200 ${
        viewMode === 'list' ? 'flex items-center gap-4' : ''
      }`}>
        <div className="text-center text-gray-500 w-full">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>No damage data available</p>
        </div>
      </div>
    )
  }

  const {
    description = 'No description provided',
    severity = 'unknown',
    propertyType = 'unknown',
    location = {},
    createdAt = new Date().toISOString(),
    photos = [],
    verificationStatus = 'pending'
  } = damage

  const { 
    address = 'No address provided' 
  } = location

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(damage)
      return
    }
    
    if (damage._id) {
      navigate(`/damages/${damage._id}`)
    }
  }

  // Helper function to get photo URL (handles both old and new formats)
  const getPhotoUrl = (photo) => {
    if (!photo) return null
    // New format: { url: "...", publicId: "..." }
    if (typeof photo === 'object' && photo.url) {
      return photo.url
    }
    // Old format: "/uploads/filename.jpg" or Cloudinary URL string
    if (typeof photo === 'string') {
      return photo
    }
    return null
  }

  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
      viewMode === 'list' 
        ? 'flex items-center p-4 gap-4' 
        : 'p-6'
    }`}>
      {/* Photos in grid mode */}
      {viewMode === 'grid' && photos.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, 3).map((photo, index) => {
              const photoUrl = getPhotoUrl(photo)
              if (!photoUrl) return null
              
              return (
                <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={`Damage photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFNUU1RTUiLz48cGF0aCBkPSJNNjMuNzUgNTAuNUM2My43NSA1Ny40MDM2IDU3LjkwMzYgNjMuMjUgNTEgNjMuMjVDNDQuMDk2NCA2My4yNSAzOC4yNSA1Ny40MDM2IDM4LjI1IDUwLjVDMzguMjUgNDMuNTk2NCA0NC4wOTY0IDM3Ljc1IDUxIDM3Ljc1QzU3LjkwMzYgMzcuNzUgNjMuNzUgNDMuNTk2NCA2My43NSA1MC41WiIgZmlsbD0iI0JCQkJCQiIvPjxwYXRoIGQ9Ik01NC4zNzUgNDUuNjI1TDQ1LjYyNSA1NC4zNzVNNDUuNjI1IDQ1LjYyNUw1NC4zNzUgNTQuMzc1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==`
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className={viewMode === 'list' ? 'flex-1' : ''}>
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {description.length > 80 ? `${description.substring(0, 80)}...` : description}
            </h3>
            <p className="text-sm text-gray-500 capitalize mt-1">{propertyType}</p>
          </div>
          <SeverityBadge severity={severity} />
        </div>

        {/* Location and Date */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{address}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{new Date(createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</span>
          </div>
        </div>

        {/* Verification Status */}
        {verificationStatus !== 'pending' && (
          <div className="mt-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              verificationStatus === 'verified'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {verificationStatus === 'verified' ? '✓ Verified' : '✗ Rejected'}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={handleViewDetails}
          className={`mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center ${
            viewMode === 'list' ? 'w-auto px-4' : ''
          }`}
        >
          View Details
          <ExternalLink className="ml-2 h-3 w-3" />
        </button>
      </div>

      {/* Photos in list mode */}
      {viewMode === 'list' && photos.length > 0 && (
        <div className="flex-shrink-0">
          <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden">
            <img
              src={getPhotoUrl(photos[0])}
              alt="Damage preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIGZpbGw9IiNFNUU1RTUiLz48cGF0aCBkPSJNNjEgNDhDNjEgNTQuNjI3NCA1NS42Mjc0IDYwIDQ5IDYwQzQyLjM3MjYgNjAgMzcgNTQuNjI3NCAzNyA0OEMzNyA0MS4zNzI2IDQyLjM3MjYgMzYgNDkgMzZINTUuNjI3NEM2MCAzNiA2MSA0MS4zNzI2IDYxIDQ4WiIgZmlsbD0iI0JCQkJCQiIvPjxwYXRoIGQ9Ik01Mi4yNSA0NEw0My43NSA1Mi41TTQzLjc1IDQ0TDUyLjI1IDUyLjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+`
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default DamageCard