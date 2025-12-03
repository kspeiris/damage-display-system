import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MapPin, Calendar, AlertCircle, CheckCircle, XCircle,
  Download, Share2, Printer, ExternalLink, Clock, User, Home,
  Building, Shield, Edit, Trash2, ChevronDown, ChevronUp,
  Image as ImageIcon, Navigation, Globe, Phone, Mail, Map,
  Eye, EyeOff, Bookmark, Flag, MoreVertical, Maximize2
} from 'lucide-react'
import { useDamage } from '../context/DamageContext'
import SeverityBadge from '../components/Damage/SeverityBadge'

// Import Leaflet for OpenStreetMap
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const DamageDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { damages, loading, updateDamage, deleteDamage } = useDamage()
  const [damage, setDamage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showCoordinates, setShowCoordinates] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    const loadDamage = async () => {
      setIsLoading(true)
      if (damages.length > 0) {
        const foundDamage = damages.find(d => d._id === id)
        if (foundDamage) {
          setDamage(foundDamage)
        } else {
          try {
            const response = await fetch(`/api/damages/${id}`)
            if (response.ok) {
              const data = await response.json()
              setDamage(data)
            }
          } catch (error) {
            console.error('Error fetching damage:', error)
          }
        }
      }
      setIsLoading(false)
    }

    loadDamage()
  }, [id, damages])

  useEffect(() => {
    if (!damage?.location?.latitude || !damage?.location?.longitude) return
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
    }

    // Initialize Leaflet map with OpenStreetMap
    const lat = parseFloat(damage.location.latitude)
    const lng = parseFloat(damage.location.longitude)
    
    if (isNaN(lat) || isNaN(lng)) return

    const map = L.map(mapRef.current).setView([lat, lng], 15)

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Create custom marker icon based on severity
    const getMarkerIcon = () => {
      const severity = damage.severity || 'moderate'
      const iconUrl = severity === 'critical' ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png' :
                     severity === 'severe' ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png' :
                     severity === 'moderate' ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png' :
                     'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
      
      return L.icon({
        iconUrl: iconUrl,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        className: 'custom-marker'
      })
    }

    // Add marker
    L.marker([lat, lng], { icon: getMarkerIcon() })
      .addTo(map)
      .bindPopup(`
        <div style="padding: 8px;">
          <strong>${damage.propertyType || 'Damage Location'}</strong><br/>
          <small>${damage.severity || 'Unknown'} severity</small>
        </div>
      `)

    // Add circle for better visibility
    L.circle([lat, lng], {
      color: damage.severity === 'critical' ? 'red' :
             damage.severity === 'severe' ? 'orange' :
             damage.severity === 'moderate' ? 'yellow' : 'green',
      fillColor: damage.severity === 'critical' ? '#f03' :
                 damage.severity === 'severe' ? '#f90' :
                 damage.severity === 'moderate' ? '#ff0' : '#6f6',
      fillOpacity: 0.2,
      radius: 100
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [damage])

  const handleVerification = async (status) => {
    try {
      await updateDamage(id, { verificationStatus: status })
      setDamage(prev => ({ ...prev, verificationStatus: status }))
    } catch (error) {
      console.error('Error updating verification:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteDamage(id)
      navigate('/reports')
    } catch (error) {
      console.error('Error deleting damage:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Damage Report: ${damage?.propertyType}`,
          text: damage?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleExportPDF = () => {
    alert('PDF export functionality would be implemented here')
  }

  const toggleFullscreen = () => {
    const mapContainer = mapRef.current?.parentElement
    if (!mapContainer) return

    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading damage report...</p>
        </div>
      </div>
    )
  }

  if (!damage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Damage Report Not Found</h2>
          <p className="text-gray-600 mb-6">
            The damage report you're looking for doesn't exist or may have been removed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              View All Reports
            </button>
          </div>
        </div>
      </div>
    )
  }

  const {
    description,
    severity,
    propertyType,
    location = {},
    createdAt,
    updatedAt,
    photos = [],
    verificationStatus = 'pending',
    reportedBy = {},
    additionalNotes = '',
    estimatedLoss,
    insuranceCovered,
    priorityLevel
  } = damage

  const { 
    address = 'No address provided',
    latitude,
    longitude,
    landmark
  } = location

  const getVerificationIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' }
      case 'rejected':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' }
      default:
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' }
    }
  }

  const VerificationIcon = getVerificationIcon().icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Enhanced Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Back to Reports</span>
                </button>
                <div className="ml-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      ID: {id?.substring(0, 8)}...
                    </span>
                    <SeverityBadge severity={severity} size="lg" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`inline-flex items-center px-4 py-2 rounded-lg ${getVerificationIcon().bg}`}>
                  <VerificationIcon className={`h-5 w-5 mr-2 ${getVerificationIcon().color}`} />
                  <span className="font-medium capitalize">{verificationStatus}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Share"
                  >
                    <Share2 className="h-5 w-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExportPDF}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Export PDF"
                  >
                    <Download className="h-5 w-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.print()}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Print"
                  >
                    <Printer className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Photos & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos Grid */}
            {photos.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Damage Photos ({photos.length})</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.slice(0, 6).map((photo, index) => {
                      const photoUrl = getPhotoUrl(photo)
                      if (!photoUrl) return null
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group relative"
                        >
                          <img
                            src={photoUrl}
                            alt={`Damage ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No photos available for this report</p>
              </div>
            )}

            {/* Interactive OpenStreetMap */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">Location Map</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    OpenStreetMap
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCoordinates(!showCoordinates)}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    {showCoordinates ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showCoordinates ? 'Hide' : 'Show'} Coordinates
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <Maximize2 className="h-4 w-4" />
                    Fullscreen
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div 
                  ref={mapRef} 
                  className="h-64 md:h-80 rounded-lg overflow-hidden bg-gray-100 mb-4"
                  style={{ minHeight: '256px' }}
                />
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{address}</p>
                      {landmark && (
                        <p className="text-sm text-gray-600 mt-1">Near: {landmark}</p>
                      )}
                    </div>
                  </div>
                  
                  {showCoordinates && latitude && longitude && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Latitude</p>
                          <p className="font-mono text-sm">{parseFloat(latitude).toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Longitude</p>
                          <p className="font-mono text-sm">{parseFloat(longitude).toFixed(6)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`
                          window.open(url, '_blank')
                        }}
                        className="mt-3 flex items-center text-sm text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in OpenStreetMap
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description & Notes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Full Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
              
              {additionalNotes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{additionalNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details & Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Report Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Reported</p>
                      <p className="text-sm font-medium">{new Date(createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium">
                      {updatedAt ? new Date(updatedAt).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Property Type</p>
                    <div className="flex items-center">
                      {propertyType === 'residential' ? (
                        <Home className="h-4 w-4 text-gray-400 mr-2" />
                      ) : (
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span className="font-medium capitalize">{propertyType}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Priority Level</p>
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium capitalize">{priorityLevel || 'Medium'}</span>
                    </div>
                  </div>
                </div>
                
                {estimatedLoss && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Estimated Loss</p>
                    <p className="text-lg font-semibold text-gray-900">
                      LKR {parseInt(estimatedLoss).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Verification Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleVerification('verified')}
                  disabled={verificationStatus === 'verified'}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                    verificationStatus === 'verified'
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {verificationStatus === 'verified' ? 'Verified' : 'Mark as Verified'}
                </button>
                
                <button
                  onClick={() => handleVerification('rejected')}
                  disabled={verificationStatus === 'rejected'}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                    verificationStatus === 'rejected'
                      ? 'bg-red-100 text-red-800 cursor-not-allowed'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  {verificationStatus === 'rejected' ? 'Rejected' : 'Mark as Rejected'}
                </button>
                
                {verificationStatus !== 'pending' && (
                  <button
                    onClick={() => handleVerification('pending')}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Reset to Pending
                  </button>
                )}
              </div>
            </div>

            {/* Reporter Information */}
            {reportedBy && Object.keys(reportedBy).length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Reported By</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">{reportedBy.name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-600">{reportedBy.role || 'Citizen'}</p>
                    </div>
                  </div>
                  
                  {reportedBy.contact && (
                    <>
                      {reportedBy.contact.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-gray-400 mr-3" />
                          <a 
                            href={`tel:${reportedBy.contact.phone}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            {reportedBy.contact.phone}
                          </a>
                        </div>
                      )}
                      
                      {reportedBy.contact.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 text-gray-400 mr-3" />
                          <a 
                            href={`mailto:${reportedBy.contact.email}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            {reportedBy.contact.email}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowEditForm(true)}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Report
                </button>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Report
                </button>
              </div>
            </div>

            {/* Insurance Info */}
            {insuranceCovered && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Shield className="h-5 w-5 text-blue-600 mr-3" />
                  <h3 className="font-semibold text-blue-900">Insurance Information</h3>
                </div>
                <p className="text-sm text-blue-700">
                  This property is covered by insurance. Contact details and policy information
                  can be provided upon verification.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Damage Report</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this damage report? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete Report
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DamageDetails