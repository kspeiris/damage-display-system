import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDamage } from '../context/DamageContext'
import DamageCard from '../components/Damage/DamageCard'
import DamageFilters from '../components/Damage/DamageFilters'
import ReportDamageModal from '../components/Damage/ReportDamageModal'
import { Plus, Search, Filter, Grid, List } from 'lucide-react'

const Reports = () => {
  const { damages, loading } = useDamage()
  const [showFilters, setShowFilters] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Debug: Log damages to see what's in the array
  useEffect(() => {
    console.log('🔍 Damages array:', damages)
    console.log('🔍 Damages length:', damages?.length)
    console.log('🔍 Sample damage:', damages?.[0])
  }, [damages])

  // ✅ FIXED: Add safety checks before calling .toLowerCase()
  const filteredDamages = damages.filter(damage => {
    // Check if damage exists
    if (!damage) return false
    
    // Get safe values (with defaults)
    const description = damage.description || ''
    const propertyType = damage.propertyType || ''
    const address = damage.location?.address || ''
    
    // Convert search term to lowercase once
    const searchLower = searchTerm.toLowerCase()
    
    // Check if any field contains the search term
    return description.toLowerCase().includes(searchLower) ||
           propertyType.toLowerCase().includes(searchLower) ||
           address.toLowerCase().includes(searchLower)
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Damage Reports</h1>
          <p className="text-gray-600 mt-1">
            {filteredDamages.length} reports found
          </p>
        </div>
        
        <button
          onClick={() => setShowReportModal(true)}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Report Damage
        </button>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search reports by description, type, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-primary-50 border-primary-500 text-primary-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 flex-shrink-0"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <DamageFilters />
            </div>
          </motion.div>
        )}

        {/* Reports Grid/List */}
        <div className="flex-1">
          {filteredDamages.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {filteredDamages.map((damage, index) => (
                <motion.div
                  key={damage.id || damage._id || `damage-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DamageCard damage={damage} viewMode={viewMode} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No damage reports found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters'
                    : 'Be the first to report damage in your area'
                  }
                </p>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Report Damage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Damage Modal */}
      <ReportDamageModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  )
}

export default Reports