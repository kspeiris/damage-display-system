import React, { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Upload, Image as ImageIcon, Check, AlertCircle, Trash2, Eye, FileText, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

const PhotoUpload = ({ 
  photos = [],
  onChange,
  maxFiles = 10,
  maxSizeMB = 10,
  showProgress = true,
  showValidation = true,
  disabled = false
}) => {
  const fileInputRef = useRef(null)
  const [uploadProgress, setUploadProgress] = useState({})
  const [uploading, setUploading] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Validate image file
  const validateImageFile = (file) => {
    const errors = []
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!validTypes.includes(file.type)) {
      errors.push(`Invalid file type: ${file.name}. Only JPG, PNG, WEBP, HEIC are allowed.`)
    }
    
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      errors.push(`${file.name}: File exceeds ${maxSizeMB}MB limit (${formatFileSize(file.size)})`)
    }
    
    // Check dimensions (optional)
    return {
      valid: errors.length === 0,
      errors,
      file
    }
  }

  // Handle file upload with progress simulation
  const handleFileUpload = useCallback(async (files) => {
    if (photos.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} photos allowed`)
      return
    }

    setUploading(true)
    const newPhotos = []
    const newProgress = {}
    const newErrors = {}

    for (const file of files) {
      const validation = validateImageFile(file)
      
      if (validation.valid) {
        const photoId = Date.now() + Math.random()
        newProgress[photoId] = 0
        
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 50))
          newProgress[photoId] = i
          setUploadProgress({...newProgress})
        }

        const preview = URL.createObjectURL(file)
        newPhotos.push({
          id: photoId,
          file,
          preview,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded'
        })

        delete newProgress[photoId]
        setUploadProgress({...newProgress})
      } else {
        newErrors[file.name] = validation.errors
        if (showValidation) {
          validation.errors.forEach(error => toast.error(error))
        }
      }
    }

    if (newPhotos.length > 0) {
      onChange([...photos, ...newPhotos])
      toast.success(`Added ${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''}`)
    }

    setValidationErrors(newErrors)
    setUploading(false)
  }, [photos, maxFiles, maxSizeMB, onChange, showValidation])

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic', '.heif']
    },
    maxSize: maxSizeMB * 1024 * 1024,
    maxFiles,
    disabled: disabled || photos.length >= maxFiles || uploading,
    multiple: true
  })

  // Handle file input change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    handleFileUpload(files)
    e.target.value = ''
  }

  // Remove photo
  const removePhoto = (id) => {
    const photoToRemove = photos.find(p => p.id === id)
    if (photoToRemove?.preview) {
      URL.revokeObjectURL(photoToRemove.preview)
    }
    const newPhotos = photos.filter(p => p.id !== id)
    onChange(newPhotos)
    toast.success('Photo removed')
  }

  // Clear all photos
  const clearAllPhotos = () => {
    photos.forEach(photo => {
      if (photo.preview) URL.revokeObjectURL(photo.preview)
    })
    onChange([])
    toast.success('All photos removed')
  }

  // Clean up object URLs
  useEffect(() => {
    return () => {
      photos.forEach(photo => {
        if (photo.preview) URL.revokeObjectURL(photo.preview)
      })
    }
  }, [photos])

  // Get file type icon
  const getFileTypeIcon = (type) => {
    if (type.includes('jpeg') || type.includes('jpg')) return '🖼️'
    if (type.includes('png')) return '🖼️'
    if (type.includes('webp')) return '🌐'
    if (type.includes('heic') || type.includes('heif')) return '📱'
    return '📷'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-lg font-semibold text-gray-900 dark:text-white">
            Damage Photos
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {photos.length}/{maxFiles} photos uploaded • Max {maxSizeMB}MB each
          </p>
        </div>
        
        {photos.length > 0 && (
          <button
            type="button"
            onClick={clearAllPhotos}
            disabled={disabled || uploading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={`
          relative rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive
            ? 'border-4 border-dashed border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/5 dark:to-indigo-500/5'
            : photos.length >= maxFiles || disabled
            ? 'border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
            : 'border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:hover:from-blue-500/5 dark:hover:to-indigo-500/5'
          }
        `}
      >
        <input
          {...getInputProps()}
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        
        <div className="space-y-4">
          {isDragActive ? (
            <>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Upload className="h-16 w-16 text-blue-500 mx-auto" />
              </motion.div>
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                Drop photos here
              </p>
              <p className="text-sm text-blue-500 dark:text-blue-400/80">
                Release to upload
              </p>
            </>
          ) : (
            <>
              <Camera className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto" />
              <div>
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  {photos.length >= maxFiles 
                    ? 'Maximum photos reached' 
                    : disabled 
                    ? 'Upload disabled'
                    : 'Drag & drop photos here'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  or click to browse • Max {maxFiles} photos • {maxSizeMB}MB each
                </p>
              </div>
            </>
          )}
          
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> JPG, PNG
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> WEBP
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> HEIC
            </span>
          </div>
        </div>
        
        {photos.length >= maxFiles && (
          <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="text-center p-4">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="font-semibold text-red-600 dark:text-red-400">Maximum {maxFiles} photos reached</p>
              <p className="text-sm text-red-500 dark:text-red-400/80">Remove some photos to add more</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {showProgress && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading...</p>
          {Object.entries(uploadProgress).map(([id, progress]) => (
            <div key={id} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Validation Errors */}
      {showValidation && Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-800 dark:text-red-300">Validation Errors</p>
              <div className="mt-2 space-y-1">
                {Object.values(validationErrors).flat().map((error, index) => (
                  <p key={index} className="text-sm text-red-600 dark:text-red-400">
                    • {error}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Previews Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Uploaded Photos ({photos.length}/{maxFiles})
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewIndex(0)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
                Preview All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  {/* Photo Container */}
                  <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm">
                    <img
                      src={photo.preview}
                      alt={`Damage evidence ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onClick={() => setPreviewIndex(index)}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center justify-between text-white">
                          <span className="text-xs font-medium truncate">
                            {photo.name}
                          </span>
                          <span className="text-xs">
                            {formatFileSize(photo.size)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Index Badge */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                        {index + 1}
                      </span>
                    </div>
                    
                    {/* Status Indicator */}
                    {photo.status === 'uploaded' && (
                      <div className="absolute top-2 left-2">
                        <div className="p-1 bg-green-500/90 text-white rounded-full">
                          <Check className="h-3 w-3" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  <motion.button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    disabled={disabled || uploading}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                  
                  {/* File Info */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{getFileTypeIcon(photo.type)}</span>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                          {photo.name}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(photo.size)}
                      </span>
                    </div>
                    
                    {/* Upload Time */}
                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {photo.type.split('/')[1].toUpperCase()}
                      </span>
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
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Full Screen Preview Modal */}
      <AnimatePresence>
        {previewIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewIndex(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <button
                type="button"
                onClick={() => setPreviewIndex(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="relative h-full">
                <img
                  src={photos[previewIndex]?.preview}
                  alt={`Preview ${previewIndex + 1}`}
                  className="w-full h-full object-contain rounded-lg"
                />
                
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewIndex(prev => 
                        prev > 0 ? prev - 1 : photos.length - 1
                      )
                    }}
                    className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                    {previewIndex + 1} / {photos.length}
                  </div>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewIndex(prev => 
                        prev < photos.length - 1 ? prev + 1 : 0
                      )
                    }}
                    className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {uploading && (
        <div className="flex items-center justify-center gap-2 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Processing photos...
          </span>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No photos uploaded yet</p>
          <p className="text-sm mt-1">
            Upload photos to document the damage for better assessment
          </p>
        </div>
      )}
    </div>
  )
}

// Add missing imports
const ChevronLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export default PhotoUpload