import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, MapPin, Camera, Check, AlertCircle } from 'lucide-react'
import { useDamage } from '../../context/DamageContext'
import toast from 'react-hot-toast'

const ReportDamageModal = ({ isOpen, onClose, initialLocation }) => {
  const { addDamage } = useDamage()
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    description: '',
    severity: 'moderate',
    propertyType: 'residential',
    latitude: initialLocation?.lat || '',
    longitude: initialLocation?.lng || '',
    address: ''
  })
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [locationLoading, setLocationLoading] = useState(false)

  const severityOptions = [
    { value: 'minor', label: 'Minor', color: 'bg-green-100 text-green-800' },
    { value: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'severe', label: 'Severe', color: 'bg-orange-100 text-orange-800' },
    { value: 'destroyed', label: 'Destroyed', color: 'bg-red-100 text-red-800' }
  ]

  const propertyTypeOptions = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'agricultural', label: 'Agricultural' }
  ]

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach(photo => {
        if (photo.preview) URL.revokeObjectURL(photo.preview)
      })
    }
  }, [])

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate file count
    if (files.length + photos.length > 5) {
      toast.error('Maximum 5 photos allowed')
      return
    }
    
    // Validate file size and type
    const maxSize = 5 * 1024 * 1024 // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    
    const validFiles = []
    const errors = []
    
    files.forEach(file => {
      // Validate file type
      if (!validTypes.includes(file.type)) {
        errors.push(`Invalid file type: ${file.name}. Please upload JPG, PNG, or WEBP images.`)
        return
      }
      
      // Validate file size
      if (file.size > maxSize) {
        errors.push(`File too large: ${file.name}. Maximum size is 5MB.`)
        return
      }
      
      validFiles.push(file)
    })
    
    // Show errors
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }
    
    // If no valid files, return
    if (validFiles.length === 0) return
    
    // Create photo objects with preview URLs
    const newPhotos = validFiles.map(file => {
      const preview = URL.createObjectURL(file)
      return {
        file,
        preview,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }
    })
    
    setPhotos(prev => [...prev, ...newPhotos])
    
    // Show success message
    if (newPhotos.length > 0) {
      toast.success(`Added ${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''}`)
    }
    
    // Reset file input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removePhoto = (index) => {
    // Revoke the object URL to prevent memory leaks
    if (photos[index].preview) {
      URL.revokeObjectURL(photos[index].preview)
    }
    setPhotos(prev => prev.filter((_, i) => i !== index))
    toast.success('Photo removed')
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        setFormData(prev => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6)
        }))
        
        toast.success('Location detected successfully')
        setLocationLoading(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = 'Unable to get your location'
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }
        
        toast.error(errorMessage)
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.description.trim()) {
      toast.error('Please provide a description')
      return
    }
    
    if (!formData.latitude || !formData.longitude) {
      toast.error('Please provide location coordinates')
      return
    }
    
    // Validate coordinates are valid numbers
    const lat = parseFloat(formData.latitude)
    const lng = parseFloat(formData.longitude)
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Please enter valid coordinates')
      return
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)')
      return
    }
    
    setLoading(true)

    try {
      // Create FormData object for file uploads
      const formDataToSend = new FormData()
      
      // Add all form fields
      formDataToSend.append('description', formData.description)
      formDataToSend.append('severity', formData.severity)
      formDataToSend.append('propertyType', formData.propertyType)
      formDataToSend.append('latitude', lat)
      formDataToSend.append('longitude', lng)
      formDataToSend.append('address', formData.address)
      
      // Add each photo file - USE FIELD NAME 'photos' (SINGULAR BUT ARRAY)
      photos.forEach((photo) => {
        formDataToSend.append('photos', photo.file) // CRITICAL: Field name must be 'photos'
      })

      console.log('📤 Submitting damage report...', {
        description: formData.description,
        severity: formData.severity,
        propertyType: formData.propertyType,
        latitude: lat,
        longitude: lng,
        address: formData.address,
        photoCount: photos.length
      })

      // Show loading toast
      const loadingToast = toast.loading('Submitting damage report...')
      
      // Use fetch to send FormData to the correct endpoint
      const response = await fetch('/api/damages', {
        method: 'POST',
        body: formDataToSend  // Don't set Content-Type header for FormData
      })
      
      const result = await response.json()
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit damage report')
      }
      
      console.log('✅ Damage report submitted:', result)
      
      // Add to context - result contains damage in result.damage
      addDamage(result.damage)
      
      toast.success(
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          <span>Damage report submitted successfully!</span>
        </div>
      )
      
      // Clean up object URLs
      photos.forEach(photo => {
        if (photo.preview) URL.revokeObjectURL(photo.preview)
      })
      
      // Close modal and reset
      onClose()
      resetForm()
      
    } catch (error) {
      console.error('❌ Submit error:', error)
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span>Failed to submit: {error.message || 'Please try again'}</span>
        </div>
      )
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    // Clean up existing photo URLs
    photos.forEach(photo => {
      if (photo.preview) URL.revokeObjectURL(photo.preview)
    })
    
    setFormData({
      description: '',
      severity: 'moderate',
      propertyType: 'residential',
      latitude: initialLocation?.lat || '',
      longitude: initialLocation?.lng || '',
      address: ''
    })
    setPhotos([])
    setCurrentStep(1)
    setLocationLoading(false)
  }

  const nextStep = () => {
    // Validate before moving to next step
    if (currentStep === 1) {
      if (!formData.description.trim()) {
        toast.error('Please provide a description')
        return
      }
    } else if (currentStep === 2) {
      if (!formData.latitude || !formData.longitude) {
        toast.error('Please provide location coordinates')
        return
      }
      
      // Validate coordinates
      const lat = parseFloat(formData.latitude)
      const lng = parseFloat(formData.longitude)
      
      if (isNaN(lat) || isNaN(lng)) {
        toast.error('Please enter valid coordinates')
        return
      }
    }
    setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => setCurrentStep(prev => prev - 1)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format coordinate display
  const formatCoordinate = (coord) => {
    const num = parseFloat(coord)
    return isNaN(num) ? '' : num.toFixed(6)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Report Damage
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Step {currentStep} of 3
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep
                        ? 'bg-blue-500 text-white'
                        : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-1 mx-2 ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Details</span>
                <span>Location</span>
                <span>Photos</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                {/* Step 1: Basic Details */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Type
                      </label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => setFormData(prev => ({ ...prev, propertyType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      >
                        {propertyTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Severity Level
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {severityOptions.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, severity: option.value }))}
                            disabled={loading}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              formData.severity === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <span className={`text-sm font-medium ${option.color}`}>
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        placeholder="Describe the damage in detail (what happened, extent of damage, etc.)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        * Required field
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location Information
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={loading || locationLoading}
                          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        >
                          {locationLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Detecting...
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4 mr-2" />
                              Use Current Location
                            </>
                          )}
                        </button>
                        <span className="text-sm text-gray-500 mt-2 sm:mt-0">
                          or enter coordinates manually
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Latitude *
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.latitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder="e.g., 27.717245"
                          disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Current: {formatCoordinate(formData.latitude)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Longitude *
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.longitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder="e.g., 85.324006"
                          disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Current: {formatCoordinate(formData.longitude)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Street address, city, district, province..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Helpful for identifying the exact location
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Photos */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Damage Photos ({photos.length}/5)
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={loading || photos.length >= 5}
                      />
                      
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading || photos.length >= 5}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {photos.length >= 5 ? 'Maximum 5 photos reached' : 'Click to upload photos'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WEBP up to 5MB each
                        </p>
                      </button>
                    </div>

                    {/* Photo Previews */}
                    {photos.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          Uploaded Photos
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {photos.map((photo, index) => (
                            <div key={index} className="relative group bg-gray-50 rounded-lg p-2">
                              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-2">
                                <img
                                  src={photo.preview}
                                  alt={`Damage photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-xs text-gray-600 truncate mb-1">
                                {photo.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatFileSize(photo.size)}
                              </div>
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                disabled={loading}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          Tips: Take clear photos showing the extent of damage from different angles
                        </p>
                      </div>
                    )}

                    {photos.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Camera className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">
                          No photos uploaded yet. Photos help verify and assess the damage.
                        </p>
                        <p className="text-xs mt-1">
                          Recommended: 2-5 clear photos from different angles
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </form>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={currentStep === 1 ? onClose : prevStep}
                disabled={loading}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors flex items-center"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center"
                >
                  Continue
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading || photos.length === 0}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Submit Report {photos.length > 0 && `(${photos.length} photo${photos.length !== 1 ? 's' : ''})`}
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ReportDamageModal