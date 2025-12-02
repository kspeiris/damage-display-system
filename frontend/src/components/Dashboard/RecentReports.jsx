import React from 'react'
import { motion } from 'framer-motion'
import { useDamage } from '../../context/DamageContext'
import { Link } from 'react-router-dom'
import SeverityBadge from '../Damage/SeverityBadge'
import { MapPin, Calendar, ArrowRight, Eye, Image as ImageIcon } from 'lucide-react'

const RecentReports = () => {
  const { damages } = useDamage()

  const recentDamages = damages.slice(0, 5)

  // Helper function to get photo URL
  const getPhotoUrl = (photo) => {
    if (!photo) return null
    // New format: { url: "...", publicId: "..." }
    if (typeof photo === 'object' && photo.url) {
      return photo.url
    }
    // Old format: string URL
    if (typeof photo === 'string') {
      return photo
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Damage Reports</h3>
        <Link
          to="/reports"
          className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <div className="divide-y divide-gray-200">
        {recentDamages.map((damage, index) => {
          const firstPhoto = damage.photos?.[0]
          const photoUrl = getPhotoUrl(firstPhoto)
          
          return (
            <motion.div
              key={damage.id || damage._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {damage.propertyType}
                    </h4>
                    <SeverityBadge severity={damage.severity} />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {damage.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {damage.location?.address || 'Location not specified'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(damage.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {photoUrl ? (
                  <div className="relative">
                    <img
                      src={photoUrl}
                      alt="Damage"
                      className="w-16 h-16 object-cover rounded-lg ml-4"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = `
                          <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center ml-4">
                            <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        `
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center ml-4">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
        {recentDamages.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No damage reports yet. Be the first to report damage in your area.
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default RecentReports