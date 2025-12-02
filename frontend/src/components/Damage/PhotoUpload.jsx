import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, X, Upload, Image } from 'lucide-react'

const PhotoUpload = ({ 
  photos = [],
  onChange,
  maxFiles = 5,
  maxSizeMB = 5
}) => {
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed')
        return false
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File size must be less than ${maxSizeMB}MB`)
        return false
      }
      return true
    })

    if (photos.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} photos allowed`)
      return
    }

    const newPhotos = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }))

    onChange([...photos, ...newPhotos])
  }

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files)
    e.target.value = '' // Reset input
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onChange(newPhotos)
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Damage Photos ({photos.length}/{maxFiles})
      </label>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {photos.length === 0 ? (
          <>
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-1">
              Click or drag photos here
            </p>
            <p className="text-sm text-gray-500">
              Upload images of the damage (max {maxFiles} photos, {maxSizeMB}MB each)
            </p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">
              Add more photos ({photos.length}/{maxFiles})
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Click or drag to upload additional photos
            </p>
          </>
        )}
      </div>

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id || index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {photo.preview ? (
                  <img
                    src={photo.preview}
                    alt={`Damage ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removePhoto(index)
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
              
              {/* File Info */}
              <div className="mt-1 text-xs text-gray-500 truncate">
                {photo.file?.name || `Photo ${index + 1}`}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, WEBP. Maximum size: {maxSizeMB}MB per image.
      </p>
    </div>
  )
}

export default PhotoUpload