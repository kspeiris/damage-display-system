import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDamage } from '../../context/DamageContext'
import { Link, useNavigate } from 'react-router-dom'
import SeverityBadge from '../Damage/SeverityBadge'
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Eye, 
  Image as ImageIcon, 
  Clock, 
  Navigation,
  Maximize2,
  User,
  AlertCircle,
  ChevronRight,
  X,
  ExternalLink
} from 'lucide-react'

const RecentReports = () => {
  const { damages } = useDamage()
  const navigate = useNavigate()
  const [expandedImage, setExpandedImage] = useState(null)
  const [activeReport, setActiveReport] = useState(null)

  // Sort by date, most recent first
  const recentDamages = Array.isArray(damages) 
    ? [...damages]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5)
    : []

  // Helper function to get photo URL with fallback
  const getPhotoUrl = (photo) => {
    if (!photo) return null
    if (typeof photo === 'object' && photo.url) {
      return photo.url
    }
    if (typeof photo === 'object' && photo.preview) {
      return photo.preview
    }
    if (typeof photo === 'string') {
      return photo
    }
    return null
  }

  // Format date to human readable
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Recently'
      
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now - date) / (1000 * 60 * 60)
      
      if (isNaN(diffInHours)) return 'Recently'
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60)
        return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`
      } else if (diffInHours < 24) {
        const diffInHoursRounded = Math.floor(diffInHours)
        return `${diffInHoursRounded} hour${diffInHoursRounded !== 1 ? 's' : ''} ago`
      } else if (diffInHours < 48) {
        return 'Yesterday'
      } else {
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
      }
    } catch (e) {
      console.error('Date formatting error:', e)
      return 'Recently'
    }
  }

  // Format full date
  const formatFullDate = (dateString) => {
    try {
      if (!dateString) return 'Date unknown'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return 'Date unknown'
    }
  }

  // Handle map location click - FIXED VERSION
  const handleMapLocationClick = (damage, event) => {
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }
    
    // Navigate to map page with coordinates or search
    if (damage.location?.coordinates && Array.isArray(damage.location.coordinates)) {
      const [lng, lat] = damage.location.coordinates
      navigate(`/map?lat=${lat}&lng=${lng}&zoom=15&report=${damage._id || damage.id}`)
    } else if (damage.latitude && damage.longitude) {
      navigate(`/map?lat=${damage.latitude}&lng=${damage.longitude}&zoom=15&report=${damage._id || damage.id}`)
    } else if (damage.address) {
      navigate(`/map?search=${encodeURIComponent(damage.address)}&report=${damage._id || damage.id}`)
    } else {
      // Fallback to just the map
      navigate('/map')
    }
  }

  // Open image in full screen
  const openImageFullScreen = (photoUrl, event) => {
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }
    setExpandedImage(photoUrl)
  }

  // Handle report click
  const handleReportClick = (damage) => {
    const reportId = damage._id || damage.id
    if (reportId) {
      navigate(`/reports/${reportId}`)
    } else {
      // Fallback to reports list
      navigate('/reports')
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Damage Reports</h3>
              <p className="text-sm text-gray-500 mt-1">Latest incidents requiring attention</p>
            </div>
          </div>
          <Link
            to="/reports"
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors group"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Reports List */}
        <div className="divide-y divide-gray-100">
          <AnimatePresence>
            {recentDamages.map((damage, index) => {
              const firstPhoto = damage.photos?.[0]
              const photoUrl = getPhotoUrl(firstPhoto)
              const timeAgo = formatDate(damage.createdAt)
              const fullDate = formatFullDate(damage.createdAt)

              return (
                <motion.div
                  key={damage.id || damage._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 hover:bg-gray-50/50 transition-all duration-200 group cursor-pointer"
                  onClick={() => handleReportClick(damage)}
                >
                  <div className="flex gap-4">
                    {/* Photo Preview */}
                    <div className="relative flex-shrink-0">
                      {photoUrl ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={photoUrl}
                            alt="Damage preview"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <div class="text-center">
                                    <svg class="h-8 w-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div class="text-xs text-gray-500">No Image</div>
                                  </div>
                                </div>
                              `
                            }}
                          />
                          
                          {/* Hover actions */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => openImageFullScreen(photoUrl, e)}
                              className="p-1.5 bg-white/90 text-gray-800 rounded-full hover:bg-white transition-colors"
                            >
                              <Maximize2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                handleReportClick(damage)
                              }}
                              className="p-1.5 bg-white/90 text-gray-800 rounded-full hover:bg-white transition-colors"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                          </div>
                          
                          {/* Photo count badge */}
                          {damage.photos?.length > 1 && (
                            <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full">
                              +{damage.photos.length - 1}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                            <div className="text-xs text-gray-500">No Image</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-gray-900 capitalize truncate">
                              {damage.propertyType || 'Unknown'} Damage
                            </span>
                            <SeverityBadge severity={damage.severity || 'moderate'} size="small" />
                            {damage.damageType && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">
                                {damage.damageType}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {damage.description || 'No description provided'}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        {/* Time */}
                        <div className="flex items-center gap-1" title={fullDate}>
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">{timeAgo}</span>
                        </div>

                        {/* Location with map link */}
                        <button
                          onClick={(e) => handleMapLocationClick(damage, e)}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors group/location"
                        >
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">
                            {damage.location?.address || damage.address || 'Unknown location'}
                          </span>
                          <Navigation className="h-3 w-3 opacity-0 group-hover/location:opacity-100 transition-opacity" />
                        </button>

                        {/* Reporter info */}
                        {damage.reportedBy && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">
                              {damage.reportedBy.name || 'Anonymous'}
                            </span>
                          </div>
                        )}

                        {/* Report ID */}
                        <div className="text-gray-400 font-mono text-xs">
                          #{damage.reportId || damage._id?.slice(-6) || damage.id?.slice(-6) || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        damage.status === 'verified' ? 'bg-green-500' :
                        damage.status === 'pending' ? 'bg-yellow-500' :
                        damage.status === 'rejected' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-xs font-medium text-gray-600 capitalize">
                        {damage.status || 'pending'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {damage.verified ? 'Verified' : 'Unverified'}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Empty State */}
          {recentDamages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-10 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No Reports Yet</h4>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Be the first to report damage in your area. Your reports help emergency responders.
              </p>
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                <MapPin className="h-4 w-4" />
                Report Damage Now
              </Link>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {recentDamages.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span>{recentDamages.length} active reports</span>
              </div>
              <div className="text-xs text-gray-500">
                Updates in real-time
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={expandedImage}
                alt="Damage photo full view"
                className="w-full h-full object-contain rounded-lg"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-white text-sm bg-black/50 px-3 py-2 rounded-full backdrop-blur-sm">
                <ImageIcon className="h-4 w-4" />
                <span>Damage Photo</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default RecentReports