// src/pages/DamageDetails.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, AlertCircle, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react'
import { useDamage } from '../context/DamageContext'
import SeverityBadge from '../components/Damage/SeverityBadge'

const DamageDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { damages, loading } = useDamage()
  const [damage, setDamage] = useState(null)

  useEffect(() => {
    if (damages.length > 0) {
      const foundDamage = damages.find(d => d._id === id)
      if (foundDamage) {
        setDamage(foundDamage)
      } else {
        // Try to fetch single damage if not in context
        console.log('Damage not found in context, would fetch from API')
      }
    }
  }, [id, damages])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!damage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Damage Report Not Found</h2>
          <p className="text-gray-600 mb-4">The damage report you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
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
    photos = [],
    verificationStatus = 'pending'
  } = damage

  const { address = 'No address provided' } = location

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Reports
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Report ID: {id?.substring(0, 8)}...</span>
              <SeverityBadge severity={severity} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Photos */}
          {photos.length > 0 && (
            <div className="bg-gray-100 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="aspect-square bg-white rounded-lg overflow-hidden shadow">
                    <img
                      src={photo}
                      alt={`Damage ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Title and Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {propertyType} Damage Report
                </h1>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              {verificationStatus !== 'pending' && (
                <div className={`mt-4 md:mt-0 inline-flex items-center px-4 py-2 rounded-lg ${
                  verificationStatus === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {verificationStatus === 'verified' ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  <span className="font-medium capitalize">{verificationStatus}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Location */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location Details
                </h3>
                <p className="text-gray-900">{address}</p>
                {location.latitude && location.longitude && (
                  <p className="text-sm text-gray-500 mt-2">
                    Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Property Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Property Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type:</span>
                    <span className="font-medium capitalize">{propertyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Severity:</span>
                    <SeverityBadge severity={severity} />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6 flex justify-end space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Mark as Verified
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DamageDetails