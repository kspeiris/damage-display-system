import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, MapPin, Camera, Check, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useDamage } from '../../context/DamageContext'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

const ReportDamageModal = ({ isOpen, onClose, initialLocation }) => {
  const { addDamage } = useDamage()
  const fileInputRef = useRef(null)
  
  // Use geolocation hook
  const { 
    location: geoLocation, 
    loading: geoLoading, 
    error: geoError, 
    getCurrentLocation 
  } = useGeolocation()
  
  const [formData, setFormData] = useState({
    description: '',
    severity: 'moderate',
    propertyType: 'residential',
    latitude: initialLocation?.lat || '',
    longitude: initialLocation?.lng || '',
    address: '',
    damageType: 'structural',
    specificTypes: []
  })
  
  const [photos, setPhotos] = useState([])
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Damage type options
  const damageTypeOptions = [
    { value: 'structural', label: 'Structural Damage', icon: '🏠', description: 'Building cracks, collapse, foundation issues' },
    { value: 'flooding', label: 'Flood Damage', icon: '💧', description: 'Water damage, inundation, drainage issues' },
    { value: 'landslide', label: 'Landslide', icon: '⛰️', description: 'Soil erosion, slope failure, debris flow' },
    { value: 'fire', label: 'Fire Damage', icon: '🔥', description: 'Burn damage, smoke damage, electrical fire' },
    { value: 'road', label: 'Road/Bridge Damage', icon: '🛣️', description: 'Cracks, collapse, blockage' },
    { value: 'utility', label: 'Utility Damage', icon: '⚡', description: 'Power lines, water pipes, gas lines' },
    { value: 'agricultural', label: 'Agricultural Damage', icon: '🌾', description: 'Crop damage, irrigation issues' }
  ]

  // Specific damage options based on type
  const specificDamageOptions = {
    structural: [
      { value: 'wall_crack', label: 'Wall Crack', icon: '🧱' },
      { value: 'roof_damage', label: 'Roof Damage', icon: '🏠' },
      { value: 'foundation', label: 'Foundation Issue', icon: '🪨' },
      { value: 'column_damage', label: 'Column Damage', icon: '🏛️' },
      { value: 'total_collapse', label: 'Total Collapse', icon: '🏚️' },
      { value: 'partial_collapse', label: 'Partial Collapse', icon: '⚠️' }
    ],
    flooding: [
      { value: 'water_level', label: 'High Water Level', icon: '🌊' },
      { value: 'water_inside', label: 'Water Inside Building', icon: '💦' },
      { value: 'mud_silt', label: 'Mud/Silt Deposit', icon: '🧱' },
      { value: 'sewage_backup', label: 'Sewage Backup', icon: '🚽' },
      { value: 'drainage_blocked', label: 'Drainage Blocked', icon: '🔄' }
    ],
    landslide: [
      { value: 'soil_erosion', label: 'Soil Erosion', icon: '🏜️' },
      { value: 'rock_fall', label: 'Rock Fall', icon: '🪨' },
      { value: 'debris_flow', label: 'Debris Flow', icon: '🌋' },
      { value: 'ground_subsidence', label: 'Ground Subsidence', icon: '🕳️' },
      { value: 'slope_failure', label: 'Slope Failure', icon: '⛰️' }
    ],
    fire: [
      { value: 'partial_burn', label: 'Partial Burn', icon: '🔥' },
      { value: 'complete_burn', label: 'Complete Burn', icon: '🔥' },
      { value: 'smoke_damage', label: 'Smoke Damage', icon: '💨' },
      { value: 'electrical_fire', label: 'Electrical Fire', icon: '⚡' }
    ],
    road: [
      { value: 'cracked_pavement', label: 'Cracked Pavement', icon: '🛣️' },
      { value: 'pothole', label: 'Pothole', icon: '🕳️' },
      { value: 'bridge_damage', label: 'Bridge Damage', icon: '🌉' },
      { value: 'road_blocked', label: 'Road Blocked', icon: '🚧' },
      { value: 'shoulder_damage', label: 'Shoulder Damage', icon: '🛣️' }
    ],
    utility: [
      { value: 'power_outage', label: 'Power Outage', icon: '💡' },
      { value: 'wiring_damage', label: 'Wiring Damage', icon: '🔌' },
      { value: 'water_pipe_burst', label: 'Water Pipe Burst', icon: '💧' },
      { value: 'gas_leak', label: 'Gas Leak', icon: '🔥' }
    ],
    agricultural: [
      { value: 'crop_flooded', label: 'Crop Flooded', icon: '🌾' },
      { value: 'soil_erosion', label: 'Soil Erosion', icon: '🏜️' },
      { value: 'irrigation_damage', label: 'Irrigation Damage', icon: '💦' },
      { value: 'livestock_affected', label: 'Livestock Affected', icon: '🐄' }
    ]
  }

  // Severity options
  const severityOptions = [
    { 
      value: 'minor', 
      label: 'Minor', 
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Cosmetic damage, minimal impact',
      level: 1
    },
    { 
      value: 'moderate', 
      label: 'Moderate', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'Repairable damage, moderate impact',
      level: 2
    },
    { 
      value: 'severe', 
      label: 'Severe', 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      description: 'Extensive damage, significant impact',
      level: 3
    },
    { 
      value: 'critical', 
      label: 'Critical', 
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Dangerous damage, immediate threat',
      level: 4
    },
    { 
      value: 'destroyed', 
      label: 'Destroyed', 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Total loss, complete destruction',
      level: 5
    }
  ]

  // Property type options
  const propertyTypeOptions = [
    { value: 'residential', label: 'Residential', icon: '🏠', description: 'Houses, apartments' },
    { value: 'commercial', label: 'Commercial', icon: '🏢', description: 'Shops, offices, hotels' },
    { value: 'public', label: 'Public Building', icon: '🏛️', description: 'Schools, hospitals, govt offices' },
    { value: 'infrastructure', label: 'Infrastructure', icon: '🌉', description: 'Roads, bridges, utilities' },
    { value: 'agricultural', label: 'Agricultural', icon: '🚜', description: 'Farms, crops, livestock' },
    { value: 'industrial', label: 'Industrial', icon: '🏭', description: 'Factories, warehouses' },
    { value: 'religious', label: 'Religious', icon: '🛐', description: 'Temples, churches, mosques' },
    { value: 'cultural', label: 'Cultural', icon: '🎭', description: 'Museums, heritage sites' }
  ]

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach(photo => {
        if (photo.preview) URL.revokeObjectURL(photo.preview)
      })
    }
  }, [photos])

  // Update location when geolocation hook returns data
  useEffect(() => {
    if (geoLocation && geoLocation.latitude && geoLocation.longitude) {
      setFormData(prev => ({
        ...prev,
        latitude: geoLocation.latitude.toFixed(6),
        longitude: geoLocation.longitude.toFixed(6)
      }))
    }
  }, [geoLocation])

  // Handle drag & drop for images
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (photos.length + acceptedFiles.length > 5) {
      toast.error('Maximum 5 photos allowed')
      return
    }
    
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(file => {
        if (file.errors[0].code === 'file-too-large') {
          toast.error(`${file.file.name}: File too large (max 5MB)`)
        } else if (file.errors[0].code === 'file-invalid-type') {
          toast.error(`${file.file.name}: Invalid file type. Use JPG, PNG, or WEBP`)
        }
      })
    }
    
    if (acceptedFiles.length === 0) return
    
    const newPhotos = acceptedFiles.map(file => {
      const preview = URL.createObjectURL(file)
      return {
        file,
        preview,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        id: Math.random().toString(36).substr(2, 9),
        uploadedAt: new Date().toISOString()
      }
    })
    
    setPhotos(prev => [...prev, ...newPhotos])
    
    if (newPhotos.length > 0) {
      toast.success(`Added ${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''}`)
    }
  }, [photos.length])

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    disabled: photos.length >= 5 || isSubmitting
  })

  // Remove photo
  const removePhoto = (id) => {
    const photoToRemove = photos.find(photo => photo.id === id)
    if (photoToRemove?.preview) {
      URL.revokeObjectURL(photoToRemove.preview)
    }
    setPhotos(prev => prev.filter(photo => photo.id !== id))
    toast.success('Photo removed')
  }

  // Handle get location
  const handleGetLocation = async () => {
    try {
      await getCurrentLocation()
    } catch (error) {
      console.error('Geolocation error:', error)
    }
  }

  // Generate mock damage data for testing
  const generateMockDamageData = (formData, photos) => {
    const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      _id: mockId,
      description: formData.description,
      severity: formData.severity,
      propertyType: formData.propertyType,
      damageType: formData.damageType,
      specificTypes: formData.specificTypes,
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(formData.longitude),
          parseFloat(formData.latitude)
        ]
      },
      address: formData.address,
      photos: photos.map((photo, index) => ({
        url: photo.preview,
        fileName: photo.name,
        size: photo.size,
        mimetype: photo.type,
        uploadedAt: new Date().toISOString()
      })),
      status: 'pending',
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  // Mock API call for testing
  const submitMockDamageReport = async (formDataToSend) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Parse form data
    const data = {};
    for (let [key, value] of formDataToSend.entries()) {
      if (key === 'specificTypes') {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = [];
        }
      } else if (key === 'photos') {
        // Skip photos in this mock
      } else {
        data[key] = value;
      }
    }
    
    const mockDamage = generateMockDamageData(data, photos);
    
    return {
      success: true,
      message: 'Damage report submitted successfully (Mock Mode)',
      damage: mockDamage
    };
  };

  // Handle submit with fallback to mock data
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) {
      return
    }
    
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      
      // Add form data
      formDataToSend.append('description', formData.description)
      formDataToSend.append('severity', formData.severity)
      formDataToSend.append('propertyType', formData.propertyType)
      formDataToSend.append('latitude', parseFloat(formData.latitude))
      formDataToSend.append('longitude', parseFloat(formData.longitude))
      formDataToSend.append('address', formData.address)
      formDataToSend.append('damageType', formData.damageType)
      formDataToSend.append('specificTypes', JSON.stringify(formData.specificTypes))
      
      // Add photos
      photos.forEach((photo) => {
        formDataToSend.append('photos', photo.file)
      })

      console.log('📤 Submitting damage report...', {
        ...formData,
        photoCount: photos.length
      })

      const loadingToast = toast.loading('Submitting damage report...')
      
      let result;
      let useMockData = false;
      
      try {
        // Try real API first
        const response = await fetch('/api/damages', {
          method: 'POST',
          body: formDataToSend
        })
        
        if (!response.ok) {
          console.warn('⚠️ Real API failed, falling back to mock data...')
          useMockData = true;
          result = await submitMockDamageReport(formDataToSend);
        } else {
          result = await response.json();
        }
      } catch (fetchError) {
        console.warn('⚠️ Network error, using mock data:', fetchError)
        useMockData = true;
        result = await submitMockDamageReport(formDataToSend);
      }
      
      toast.dismiss(loadingToast)
      
      if (useMockData) {
        toast(
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <span>Using demo data (backend unavailable)</span>
          </div>,
          { duration: 4000 }
        )
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit damage report')
      }
      
      console.log('✅ Damage report submitted:', result)
      
      // Add to context
      if (result.damage) {
        addDamage(result.damage)
      }
      
      toast.success(
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          <span>{result.message || 'Damage report submitted successfully!'}</span>
        </div>
      )
      
      // Clean up and close
      photos.forEach(photo => {
        if (photo.preview) URL.revokeObjectURL(photo.preview)
      })
      
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
      setIsSubmitting(false)
    }
  }

  // Reset form
  const resetForm = () => {
    photos.forEach(photo => {
      if (photo.preview) URL.revokeObjectURL(photo.preview)
    })
    
    setFormData({
      description: '',
      severity: 'moderate',
      propertyType: 'residential',
      latitude: initialLocation?.lat || '',
      longitude: initialLocation?.lng || '',
      address: '',
      damageType: 'structural',
      specificTypes: []
    })
    setPhotos([])
    setCurrentStep(1)
  }

  // Validate step
  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.damageType) {
          toast.error('Please select a damage type')
          return false
        }
        if (!formData.propertyType) {
          toast.error('Please select a property type')
          return false
        }
        if (!formData.severity) {
          toast.error('Please select a severity level')
          return false
        }
        return true
        
      case 2:
        if (!formData.latitude || !formData.longitude) {
          toast.error('Please provide location coordinates')
          return false
        }
        
        const lat = parseFloat(formData.latitude)
        const lng = parseFloat(formData.longitude)
        
        if (isNaN(lat) || isNaN(lng)) {
          toast.error('Please enter valid coordinates')
          return false
        }
        
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          toast.error('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)')
          return false
        }
        return true
        
      case 3:
        if (photos.length === 0) {
          toast.error('Please upload at least one photo')
          return false
        }
        if (!formData.description.trim()) {
          toast.error('Please provide a description')
          return false
        }
        return true
        
      default:
        return true
    }
  }

  // Navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  // Helper functions
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatCoordinate = (coord) => {
    const num = parseFloat(coord)
    return isNaN(num) ? '' : num.toFixed(6)
  }

  const toggleSpecificType = (type) => {
    setFormData(prev => ({
      ...prev,
      specificTypes: prev.specificTypes.includes(type)
        ? prev.specificTypes.filter(t => t !== type)
        : [...prev.specificTypes, type]
    }))
  }

  // Steps configuration
  const steps = [
    { number: 1, name: 'Damage Type', icon: '⚠️', description: 'Select type and severity' },
    { number: 2, name: 'Location', icon: '📍', description: 'Set damage location' },
    { number: 3, name: 'Photos & Details', icon: '📷', description: 'Upload photos and describe' }
  ]

  // Get current specific damage options
  const currentSpecificOptions = specificDamageOptions[formData.damageType] || []

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Report Damage
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Step {currentStep} of 3 • {steps[currentStep - 1].name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-6 pb-4">
              <div className="relative">
                {/* Background line */}
                <div className="absolute top-5 left-0 right-0 h-2 bg-gray-200 rounded-full z-0" />
                
                {/* Progress line */}
                <motion.div 
                  className="absolute top-5 left-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full z-10"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
                
                {/* Step indicators */}
                <div className="relative flex justify-between z-20">
                  {steps.map((step) => (
                    <div key={step.number} className="flex flex-col items-center">
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-4 transition-all duration-300 ${
                          step.number === currentStep
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-white shadow-lg scale-110'
                            : step.number < currentStep
                            ? 'bg-green-500 text-white border-white shadow-md'
                            : 'bg-white text-gray-400 border-gray-200'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {step.number < currentStep ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span>{step.icon}</span>
                        )}
                      </motion.div>
                      <div className="text-center mt-3">
                        <span className={`text-xs font-semibold ${
                          step.number === currentStep ? 'text-blue-600' : 
                          step.number < currentStep ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </span>
                        <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                {/* Step 1: Damage Type */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {/* Damage Type Selection */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-4">
                        Select Damage Type
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {damageTypeOptions.map((option) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              damageType: option.value,
                              specificTypes: [] 
                            }))}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                              formData.damageType === option.value
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{option.icon}</span>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {option.label}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {option.description}
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Specific Damage Types */}
                    {currentSpecificOptions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                      >
                        <label className="block text-lg font-semibold text-gray-900">
                          Select Specific Damage (Optional)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {currentSpecificOptions.map((option) => (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() => toggleSpecificType(option.value)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                                formData.specificTypes.includes(option.value)
                                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-2 border-blue-300 shadow-sm'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                              }`}
                            >
                              <span>{option.icon}</span>
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Property Type */}
                    <div className="space-y-4">
                      <label className="block text-lg font-semibold text-gray-900">
                        Property Type
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {propertyTypeOptions.map((option) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, propertyType: option.value }))}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${
                              formData.propertyType === option.value
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="text-3xl mb-2">{option.icon}</div>
                            <div className="font-medium text-gray-900">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {option.description}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Severity Level */}
                    <div className="space-y-4">
                      <label className="block text-lg font-semibold text-gray-900">
                        Severity Level
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {severityOptions.map((option) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, severity: option.value }))}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              formData.severity === option.value
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${option.color}`}>
                                {option.label}
                              </span>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < option.level
                                        ? option.value === 'minor' ? 'bg-green-400' :
                                          option.value === 'moderate' ? 'bg-yellow-400' :
                                          option.value === 'severe' ? 'bg-orange-400' :
                                          option.value === 'critical' ? 'bg-red-400' :
                                          'bg-purple-400'
                                        : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600">
                              {option.description}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-6">
                        Damage Location
                      </label>
                      
                      {/* Auto-location Card */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-800">Auto-Detect Location</h3>
                            <p className="text-sm text-blue-600">
                              Use your device's GPS for accurate coordinates
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={geoLoading || isSubmitting}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          {geoLoading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Detecting location...</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-5 w-5" />
                              <span>Use Current Location</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Error Message */}
                      {geoError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
                        >
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <div>
                              <p className="font-medium text-red-800">Location Error</p>
                              <p className="text-sm text-red-600 mt-1">{geoError}</p>
                              <p className="text-xs text-red-500 mt-2">
                                Please enter coordinates manually or enable location services
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Manual Coordinates */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-4">
                            Manual Coordinates
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Latitude *
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="any"
                                  value={formData.latitude}
                                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  required
                                  placeholder="27.717245"
                                  disabled={isSubmitting}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                  ↕
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">
                                Current: {formatCoordinate(formData.latitude)}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Longitude *
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="any"
                                  value={formData.longitude}
                                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  required
                                  placeholder="85.324006"
                                  disabled={isSubmitting}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                  ↔
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">
                                Current: {formatCoordinate(formData.longitude)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Address Details (Optional)
                          </label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Street, Ward, Municipality, District, Province..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            disabled={isSubmitting}
                          />
                          <p className="text-xs text-gray-500">
                            Add detailed address to help first responders locate the exact spot
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Photos & Details */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-6">
                        Photos & Description
                      </label>

                      {/* Drag & Drop Area */}
                      <div
                        {...getRootProps()}
                        className={`relative rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                          isDragActive
                            ? 'border-4 border-dashed border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50'
                            : photos.length >= 5
                            ? 'border-2 border-dashed border-gray-300 bg-gray-50 cursor-not-allowed'
                            : 'border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br from-blue-50/50 to-indigo-50/50'
                        }`}
                      >
                        <input {...getInputProps()} />
                        
                        <div className="space-y-4">
                          {isDragActive ? (
                            <>
                              <div className="relative">
                                <Upload className="h-16 w-16 text-blue-500 mx-auto animate-bounce" />
                                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
                              </div>
                              <p className="text-xl font-semibold text-blue-600">
                                Drop photos here
                              </p>
                              <p className="text-sm text-blue-500">
                                Release to upload
                              </p>
                            </>
                          ) : (
                            <>
                              <Camera className="h-16 w-16 text-gray-400 mx-auto" />
                              <div>
                                <p className="text-xl font-semibold text-gray-700">
                                  {photos.length >= 5 ? 'Maximum photos reached' : 'Drag & drop photos here'}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                  or click to browse • Max 5 photos • 5MB each
                                </p>
                              </div>
                            </>
                          )}
                          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                            <span>📷 JPG</span>
                            <span>🖼️ PNG</span>
                            <span>🌐 WEBP</span>
                          </div>
                        </div>
                        
                        {photos.length >= 5 && (
                          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <div className="text-center p-4">
                              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                              <p className="font-semibold text-red-600">Maximum 5 photos reached</p>
                              <p className="text-sm text-red-500">Remove some photos to add more</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Photo Previews */}
                      {photos.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="mt-8"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Uploaded Photos ({photos.length}/5)
                            </h3>
                            <span className="text-sm text-gray-500">
                              Click to preview • Click × to remove
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            {photos.map((photo, index) => (
                              <motion.div
                                key={photo.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative group"
                              >
                                <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 shadow-sm">
                                  <img
                                    src={photo.preview}
                                    alt={`Damage photo ${index + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <div className="absolute top-2 right-2">
                                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                                      {index + 1}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removePhoto(photo.id)}
                                  disabled={isSubmitting}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-lg hover:shadow-xl"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                <div className="mt-2 space-y-1">
                                  <p className="text-xs font-medium text-gray-700 truncate">
                                    {photo.name}
                                  </p>
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{formatFileSize(photo.size)}</span>
                                    <span>
                                      {new Date(photo.uploadedAt).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          <p className="text-sm text-gray-500 mt-4">
                            💡 Tip: Upload clear photos from different angles to help assessment
                          </p>
                        </motion.div>
                      )}

                      {/* Description */}
                      <div className="mt-8 space-y-4">
                        <label className="block text-lg font-semibold text-gray-900">
                          Detailed Description *
                        </label>
                        <div className="relative">
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={5}
                            placeholder="Describe the damage in detail...
• What happened and when?
• Extent of the damage
• Any immediate risks or dangers?
• Number of people affected?
• Estimated cost of damage?
• Any special requirements for response?"
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                            required
                            disabled={isSubmitting}
                          />
                          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                            {formData.description.length}/2000
                          </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">
                                Help first responders prioritize
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                Be specific about damage extent, risks, and urgency. Clear descriptions help assessment teams allocate resources effectively.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center p-6 border-t border-gray-100 bg-gray-50/50">
              <motion.button
                type="button"
                onClick={currentStep === 1 ? onClose : prevStep}
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2 font-medium rounded-xl hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </motion.button>
              
              <div className="flex items-center gap-3">
                {currentStep < 3 ? (
                  <>
                    <span className="text-sm text-gray-500 hidden sm:block">
                      Step {currentStep} of 3
                    </span>
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                    >
                      Continue to {steps[currentStep].name}
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting || photos.length === 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Submitting Report...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        <span>
                          Submit Damage Report
                          {photos.length > 0 && ` (${photos.length} photo${photos.length !== 1 ? 's' : ''})`}
                        </span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ReportDamageModal