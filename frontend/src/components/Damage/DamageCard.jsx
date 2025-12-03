import React, { useState, useRef, useEffect } from 'react'
import { 
  MapPin, 
  Calendar, 
  AlertCircle, 
  ExternalLink, 
  Map, 
  ChevronRight,
  ZoomIn,
  Eye,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  X,
  Home,
  Building,
  Factory,
  School,
  Hospital,
  Flag,
  Navigation,
  Maximize2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SeverityBadge from './SeverityBadge'
import { useNavigate } from 'react-router-dom'

const DamageCard = ({ damage, viewMode = 'grid', onViewDetails, onViewOnMap }) => {
  const navigate = useNavigate()
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const imgRef = useRef(null)
  const cardRef = useRef(null)

  // Handle missing damage data
  if (!damage) {
    return (
      <div className={`bg-white rounded-xl shadow p-6 border-2 border-dashed border-gray-200 ${
        viewMode === 'list' ? 'flex items-center gap-4' : ''
      }`}>
        <div className="text-center text-gray-500 w-full">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">No damage data available</p>
        </div>
      </div>
    )
  }

  const {
    _id,
    description = 'No description provided',
    severity = 'unknown',
    propertyType = 'unknown',
    location = {},
    createdAt = new Date().toISOString(),
    updatedAt,
    photos = [],
    verificationStatus = 'pending',
    reportedBy = {},
    urgency = 'normal',
    estimatedLoss,
    insuranceCovered,
    additionalNotes
  } = damage

  const { 
    address = 'No address provided',
    latitude,
    longitude,
    landmark
  } = location

  // Property type icon mapping
  const getPropertyIcon = () => {
    switch (propertyType?.toLowerCase()) {
      case 'residential': return <Home className="h-4 w-4" />
      case 'commercial': return <Building className="h-4 w-4" />
      case 'industrial': return <Factory className="h-4 w-4" />
      case 'educational': return <School className="h-4 w-4" />
      case 'medical': return <Hospital className="h-4 w-4" />
      default: return <Flag className="h-4 w-4" />
    }
  }

  // Severity-based border colors
  const getSeverityBorderColor = () => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'border-l-4 border-red-500'
      case 'severe': return 'border-l-4 border-orange-500'
      case 'moderate': return 'border-l-4 border-yellow-500'
      case 'minor': return 'border-l-4 border-green-500'
      case 'destroyed': return 'border-l-4 border-purple-500'
      default: return 'border-l-4 border-gray-400'
    }
  }

  // Urgency styles
  const getUrgencyBadge = () => {
    switch (urgency) {
      case 'urgent': 
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
      case 'emergency': 
        return 'bg-gradient-to-r from-red-600 to-red-700 text-white animate-pulse shadow-lg shadow-red-600/40'
      case 'high': 
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
      case 'normal': 
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      default: 
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    }
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

  // Format date with relative time
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
      }
      
      if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
      }
      
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Unknown date'
    }
  }

  // Handle viewing details
  const handleViewDetails = (e) => {
    if (e) e.stopPropagation()
    if (onViewDetails) {
      onViewDetails(damage)
      return
    }
    
    if (_id) {
      navigate(`/damages/${_id}`)
    }
  }

  // Handle viewing on map
  const handleViewOnMap = (e) => {
    if (e) e.stopPropagation()
    if (onViewOnMap) {
      onViewOnMap(damage)
    } else if (latitude && longitude) {
      navigate(`/map?lat=${latitude}&lng=${longitude}&id=${_id}`)
    } else {
      navigate('/map')
    }
  }

  // Toggle favorite
  const handleToggleFavorite = (e) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    // In a real app, you would save this to a database
  }

  // Handle image click
  const handleImageClick = (e, index = 0) => {
    e.stopPropagation()
    setSelectedImageIndex(index)
    setShowImageModal(true)
  }

  // Close modal
  const closeImageModal = (e) => {
    if (e) e.stopPropagation()
    setShowImageModal(false)
  }

  // Navigate to next/prev image in modal
  const navigateImage = (direction) => {
    if (direction === 'next' && selectedImageIndex < photos.length - 1) {
      setSelectedImageIndex(prev => prev + 1)
    } else if (direction === 'prev' && selectedImageIndex > 0) {
      setSelectedImageIndex(prev => prev - 1)
    }
  }

  // Keyboard shortcuts for image modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeImageModal()
      }
      if (e.key === 'ArrowLeft') {
        navigateImage('prev')
      }
      if (e.key === 'ArrowRight') {
        navigateImage('next')
      }
    }

    if (showImageModal) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [showImageModal, selectedImageIndex])

  // Main photo for display
  const mainPhoto = photos.length > 0 ? getPhotoUrl(photos[0]) : null
  const hasMultiplePhotos = photos.length > 1

  // Truncate text based on view mode
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className={`
          relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 
          ${getSeverityBorderColor()}
          ${viewMode === 'list' ? 'flex flex-col md:flex-row items-stretch p-0 overflow-hidden' : 'p-0 overflow-hidden'}
          border border-gray-200
          ${isHovering ? 'ring-2 ring-primary-500/20' : ''}
          cursor-pointer group
        `}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleViewDetails}
      >
        {/* Photo Section */}
        <div 
          className={`
            relative overflow-hidden cursor-pointer flex-shrink-0
            ${viewMode === 'list' ? 'md:w-64 w-full h-56 md:h-auto' : 'h-56 sm:h-64'}
          `}
          onClick={(e) => handleImageClick(e, 0)}
        >
          {/* Loading skeleton */}
          {!isImageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"></div>
          )}

          {/* Main Image */}
          {mainPhoto && !imageError ? (
            <>
              <img
                ref={imgRef}
                src={mainPhoto}
                alt="Damage photo"
                className={`
                  w-full h-full object-cover transition-transform duration-700
                  group-hover:scale-105
                  ${!isImageLoaded ? 'opacity-0' : 'opacity-100'}
                `}
                loading="lazy"
                onLoad={() => {
                  setIsImageLoaded(true)
                  setImageError(false)
                }}
                onError={() => {
                  setIsImageLoaded(true)
                  setImageError(true)
                }}
              />

              {/* Image overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center space-x-2 text-white">
                    <ZoomIn className="h-5 w-5" />
                    <span className="text-sm font-medium">Click to enlarge</span>
                  </div>
                  {hasMultiplePhotos && (
                    <div className="mt-2 px-3 py-1 bg-black/70 rounded-full text-xs text-white inline-flex items-center backdrop-blur-sm">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      {photos.length} photos
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Fallback when no image */
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center p-6">
                <div className="relative inline-block">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center border border-white">
                    <AlertCircle className="h-3 w-3 text-blue-600" />
                  </div>
                </div>
                <p className="text-gray-500 font-medium mt-3 text-sm">No Photo Available</p>
              </div>
            </div>
          )}

          {/* Urgency badge */}
          {urgency && urgency !== 'normal' && (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold ${getUrgencyBadge()} shadow-lg`}
            >
              {urgency.toUpperCase()}
            </motion.div>
          )}

          {/* Favorite button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <svg 
              className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </motion.button>

          {/* Photo count badge */}
          {hasMultiplePhotos && (
            <div className="absolute top-3 right-12 px-2.5 py-1 bg-black/80 text-white text-xs rounded-full flex items-center shadow-lg backdrop-blur-sm">
              <ImageIcon className="h-3.5 w-3.5 mr-1" />
              {photos.length}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className={viewMode === 'list' ? 'flex-1 p-5 md:p-6' : 'p-5 sm:p-6'}>
          {/* Header with severity and verification */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <SeverityBadge severity={severity} size="sm" />
                {verificationStatus !== 'pending' && (
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    verificationStatus === 'verified'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {verificationStatus === 'verified' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Description */}
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2">
                {viewMode === 'grid' ? truncateText(description, 80) : truncateText(description, 120)}
              </h3>
              
              {/* Property Type */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <span className="mr-2">{getPropertyIcon()}</span>
                <span className="capitalize">{propertyType?.replace(/_/g, ' ') || 'Unknown Property'}</span>
              </div>
            </div>

            {/* Quick actions on hover */}
            <AnimatePresence>
              {isHovering && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center space-x-1 ml-2"
                >
                  <button
                    onClick={handleViewOnMap}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                    title="View on map"
                  >
                    <Navigation className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleImageClick(e, 0)}
                    className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                    title="View photos"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Location and metadata */}
          <div className="space-y-3 mb-4">
            {/* Location */}
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-sm text-gray-700 line-clamp-2">{address}</span>
                {landmark && (
                  <p className="text-xs text-gray-500 mt-1">Near: {landmark}</p>
                )}
              </div>
            </div>
            
            {/* Date & Time */}
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
              <span className="font-medium">{formatDate(createdAt)}</span>
              {updatedAt && createdAt !== updatedAt && (
                <span className="ml-2 text-xs text-gray-500">(Updated)</span>
              )}
            </div>

            {/* Reporter info if available */}
            {reportedBy?.name && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                <span className="truncate">
                  Reported by: <span className="font-medium text-gray-800">{reportedBy.name}</span>
                  {reportedBy.role && <span className="text-gray-500"> ({reportedBy.role})</span>}
                </span>
              </div>
            )}

            {/* Additional info badges */}
            {(estimatedLoss || insuranceCovered) && (
              <div className="flex flex-wrap gap-2 pt-2">
                {estimatedLoss && (
                  <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-200">
                    Loss: LKR {parseInt(estimatedLoss).toLocaleString()}
                  </span>
                )}
                {insuranceCovered && (
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                    Insured
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail gallery for grid view */}
          {viewMode === 'grid' && photos.length > 1 && !imageError && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">Additional photos:</p>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {photos.slice(1, 4).map((photo, index) => {
                  const photoUrl = getPhotoUrl(photo)
                  if (!photoUrl) return null
                  
                  return (
                    <div
                      key={index}
                      className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group border border-gray-200"
                      onClick={(e) => handleImageClick(e, index + 1)}
                    >
                      <img
                        src={photoUrl}
                        alt={`Thumbnail ${index + 2}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          `
                        }}
                      />
                      {index === 2 && photos.length > 4 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">+{photos.length - 4}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button 
              onClick={handleViewDetails}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-semibold flex items-center justify-center group shadow-lg shadow-blue-500/25"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={handleViewOnMap}
              className="flex-1 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 text-sm font-semibold flex items-center justify-center group shadow-lg shadow-gray-600/25"
            >
              <Map className="h-4 w-4 mr-2" />
              View on Map
            </button>
          </div>
        </div>

        {/* Hover indicator */}
        <div className={`
          absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-primary-500 to-blue-600 transform transition-transform duration-300
          ${isHovering ? 'translate-x-0' : 'translate-x-full'}
        `}></div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={closeImageModal}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeImageModal}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10 transition-colors p-2"
              >
                <X className="h-6 w-6" />
              </motion.button>
              
              {/* Main image container */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={getPhotoUrl(photos[selectedImageIndex])}
                  alt={`Damage image ${selectedImageIndex + 1}`}
                  className="w-full max-h-[60vh] object-contain mx-auto"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = `data:image/svg+xml;base64,${btoa(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
                        <rect width="800" height="600" fill="#111827"/>
                        <text x="400" y="300" fill="#6b7280" font-family="system-ui" font-size="24" text-anchor="middle" dy=".3em">
                          Image not available
                        </text>
                      </svg>
                    `)}`
                  }}
                />
                
                {/* Navigation arrows */}
                {photos.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateImage('prev')
                      }}
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-all ${
                        selectedImageIndex > 0 
                          ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm cursor-pointer'
                          : 'opacity-0 cursor-default'
                      }`}
                      disabled={selectedImageIndex === 0}
                    >
                      <ChevronRight className="h-6 w-6 rotate-180" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateImage('next')
                      }}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-all ${
                        selectedImageIndex < photos.length - 1
                          ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm cursor-pointer'
                          : 'opacity-0 cursor-default'
                      }`}
                      disabled={selectedImageIndex === photos.length - 1}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </motion.button>
                  </>
                )}
              </div>
              
              {/* Thumbnail strip */}
              {photos.length > 1 && (
                <div className="flex justify-center space-x-2 mt-6 overflow-x-auto py-3 px-2">
                  {photos.map((photo, index) => {
                    const photoUrl = getPhotoUrl(photo)
                    if (!photoUrl) return null
                    
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedImageIndex(index)
                        }}
                        className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shadow-lg ${
                          selectedImageIndex === index 
                            ? 'border-white scale-110 ring-2 ring-white/50' 
                            : 'border-transparent hover:border-white/50'
                        }`}
                      >
                        <img
                          src={photoUrl}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    )
                  })}
                </div>
              )}
              
              {/* Image info */}
              <div className="text-white text-center mt-4 space-y-2">
                <p className="text-lg font-medium">
                  Image {selectedImageIndex + 1} of {photos.length}
                </p>
                <p className="text-gray-300 text-sm px-4">
                  {truncateText(description, 100)}
                </p>
                {additionalNotes && (
                  <p className="text-gray-400 text-xs px-4 italic">
                    {truncateText(additionalNotes, 80)}
                  </p>
                )}
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="text-gray-400 text-center text-xs mt-6 space-x-4">
                <kbd className="px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">ESC</kbd>
                <span className="text-gray-500">Close</span>
                <kbd className="px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700 ml-4">← →</kbd>
                <span className="text-gray-500">Navigate</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DamageCard