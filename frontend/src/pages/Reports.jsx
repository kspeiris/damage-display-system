import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDamage } from '../context/DamageContext'
import DamageCard from '../components/Damage/DamageCard'
import DamageFilters from '../components/Damage/DamageFilters'
import ReportDamageModal from '../components/Damage/ReportDamageModal'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  X,
  ChevronDown,
  Loader2
} from 'lucide-react'

// Shimmer loading placeholder component
const ShimmerCard = ({ viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex">
          <div className="w-32 h-24 bg-gray-200 rounded mr-4"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-4">
      <div className="h-40 bg-gray-200 rounded mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  )
}

const Reports = () => {
  const { damages, loading, hasMore, loadMoreDamages } = useDamage()
  const [showFilters, setShowFilters] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const observerRef = useRef()
  const loadMoreRef = useRef()

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter damages with safety checks
  const filteredDamages = damages.filter(damage => {
    if (!damage) return false
    
    const description = damage.description || ''
    const propertyType = damage.propertyType || ''
    const address = damage.location?.address || ''
    
    const searchLower = searchTerm.toLowerCase()
    
    return description.toLowerCase().includes(searchLower) ||
           propertyType.toLowerCase().includes(searchLower) ||
           address.toLowerCase().includes(searchLower)
  })

  // Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMore()
        }
      },
      { threshold: 0.5 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [loading, hasMore, isLoadingMore])

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    try {
      await loadMoreDamages()
    } catch (error) {
      console.error('Error loading more damages:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, loadMoreDamages])

  // Render loading skeletons
  if (loading && damages.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header shimmer */}
        <div className="animate-pulse mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>

        {/* Controls shimmer */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 h-10 bg-gray-200 rounded"></div>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-20 bg-gray-200 rounded"></div>
            <div className="h-10 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Content shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ShimmerCard key={i} viewMode="grid" />
          ))}
        </div>
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
            {filteredDamages.length} {filteredDamages.length === 1 ? 'report' : 'reports'} found
            {searchTerm && ' • Searching: "' + searchTerm + '"'}
          </p>
        </div>
        
        <button
          onClick={() => setShowReportModal(true)}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm hover:shadow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Report Damage
        </button>
      </div>

      {/* Mobile Filter Button (always visible on mobile) */}
      {isMobile && (
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full mb-4 flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {showFilters && (
            <X className="h-4 w-4 ml-2" />
          )}
        </button>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar - Desktop */}
        {!isMobile && showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-64 flex-shrink-0"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <DamageFilters />
            </div>
          </motion.div>
        )}

        {/* Filters Sidebar - Mobile (Overlay) */}
        <AnimatePresence>
          {isMobile && showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center p-4"
              onClick={() => setShowFilters(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <DamageFilters />
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full mt-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 ${!isMobile && showFilters ? '' : 'lg:col-span-3'}`}>
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reports by description, type, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Filter Toggle - Desktop only */}
              {!isMobile && (
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
              )}
              
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Reports Grid/List */}
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' 
            : 'space-y-4'
          }>
            {filteredDamages.length > 0 ? (
              <>
                {filteredDamages.map((damage, index) => (
                  <motion.div
                    key={damage.id || damage._id || `damage-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DamageCard damage={damage} viewMode={viewMode} />
                  </motion.div>
                ))}

                {/* Infinite scroll trigger */}
                {hasMore && (
                  <div 
                    ref={loadMoreRef}
                    className={`${viewMode === 'grid' ? 'col-span-full' : ''} text-center py-8`}
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                        <span className="text-gray-600">Loading more reports...</span>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        <ChevronDown className="h-5 w-5 mx-auto mb-2 animate-bounce" />
                        Scroll for more reports
                      </div>
                    )}
                  </div>
                )}

                {/* End of results */}
                {!hasMore && filteredDamages.length > 10 && (
                  <div className={`${viewMode === 'grid' ? 'col-span-full' : ''} text-center py-8`}>
                    <div className="inline-block px-4 py-2 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-sm">
                        You've reached the end • {filteredDamages.length} reports loaded
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={`${viewMode === 'grid' ? 'col-span-full' : ''} text-center py-12`}>
                <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No damage reports found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? 'Try adjusting your search terms or filters'
                      : 'Be the first to report damage in your area'
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Clear Search
                      </button>
                    )}
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Report Damage
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Load more button for manual trigger */}
          {hasMore && !isLoadingMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center mx-auto"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Load More Reports
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-40 p-4 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 hover:shadow-xl transition-all"
          onClick={() => setShowReportModal(true)}
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}

      {/* Report Damage Modal */}
      <ReportDamageModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  )
}

export default Reports