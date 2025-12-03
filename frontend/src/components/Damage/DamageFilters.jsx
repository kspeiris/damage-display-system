import React, { useState, useEffect } from 'react'
import { 
  Filter, 
  X, 
  Search, 
  Camera, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  SlidersHorizontal,
  RotateCcw,
  SortAsc,
  Navigation
} from 'lucide-react'

const DamageFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    severity: 'all',
    propertyType: 'all',
    dateRange: 'all',
    hasPhoto: false,
    search: '',
    ...initialFilters
  })
  
  const [sortBy, setSortBy] = useState('newest')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        updateFilters({ search: searchTerm })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load cached location
  useEffect(() => {
    try {
      const cachedLocation = localStorage.getItem('userLocation')
      if (cachedLocation) {
        const { lat, lng, timestamp } = JSON.parse(cachedLocation)
        // Use cached location if less than 30 minutes old
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          setUserLocation({ lat, lng })
        }
      }
    } catch (error) {
      console.error('Error loading cached location:', error)
    }
  }, [])

  const severityOptions = [
    { value: 'all', label: 'All Severities', color: 'text-gray-500' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'low', label: 'Low', color: 'text-green-600' }
  ]

  const propertyTypeOptions = [
    { value: 'all', label: 'All Types', icon: '🏠' },
    { value: 'residential', label: 'Residential', icon: '🏡' },
    { value: 'commercial', label: 'Commercial', icon: '🏢' },
    { value: 'public', label: 'Public Building', icon: '🏛️' },
    { value: 'infrastructure', label: 'Infrastructure', icon: '🛣️' },
    { value: 'agricultural', label: 'Agricultural', icon: '🌾' },
    { value: 'vehicle', label: 'Vehicle', icon: '🚗' }
  ]

  const dateRangeOptions = [
    { value: 'all', label: 'All Time', icon: Calendar },
    { value: 'today', label: 'Today', icon: Calendar },
    { value: '24h', label: 'Last 24 Hours', icon: Calendar },
    { value: '7d', label: 'Last 7 Days', icon: Calendar },
    { value: '30d', label: 'Last 30 Days', icon: Calendar }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: SortAsc },
    { value: 'severity', label: 'Highest Severity', icon: AlertTriangle },
    { value: 'nearest', label: 'Nearest to Me', icon: Navigation },
    { value: 'verified', label: 'Verified Reports', icon: '✓' }
  ]

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setLocationLoading(true)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const location = { lat: latitude, lng: longitude }
        setUserLocation(location)
        setLocationLoading(false)
        
        // Store in localStorage for future use
        localStorage.setItem('userLocation', JSON.stringify({
          ...location,
          timestamp: Date.now()
        }))
        
        // Update sort to nearest if user clicked nearest button
        if (sortBy === 'nearest') {
          handleSortChange('nearest')
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        setLocationLoading(false)
        alert('Unable to get your location. Please check your browser settings.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    )
  }

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Call parent callback with filters and sort
    if (onFilterChange) {
      onFilterChange({
        filters: updatedFilters,
        sortBy
      })
    }
  }

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value })
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    
    // If selecting nearest and no location, get location first
    if (value === 'nearest' && !userLocation) {
      getLocation()
    } else {
      // Call parent with updated sort
      if (onFilterChange) {
        onFilterChange({
          filters,
          sortBy: value
        })
      }
    }
  }

  const handleNearestToMe = () => {
    if (!userLocation) {
      getLocation()
    }
    setSortBy('nearest')
    if (onFilterChange) {
      onFilterChange({
        filters,
        sortBy: 'nearest'
      })
    }
  }

  const clearFilters = () => {
    const resetFilters = {
      severity: 'all',
      propertyType: 'all',
      dateRange: 'all',
      hasPhoto: false,
      search: ''
    }
    
    setFilters(resetFilters)
    setSearchTerm('')
    setSortBy('newest')
    
    if (onFilterChange) {
      onFilterChange({
        filters: resetFilters,
        sortBy: 'newest'
      })
    }
  }

  const hasActiveFilters = filters.severity !== 'all' || 
                          filters.propertyType !== 'all' || 
                          filters.dateRange !== 'all' ||
                          filters.hasPhoto ||
                          filters.search ||
                          sortBy !== 'newest'

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.severity !== 'all') count++
    if (filters.propertyType !== 'all') count++
    if (filters.dateRange !== 'all') count++
    if (filters.hasPhoto) count++
    if (filters.search) count++
    if (sortBy !== 'newest') count++
    return count
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by location, description, or reporter..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('')
              updateFilters({ search: '' })
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            showFilters 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters {hasActiveFilters && `(${getActiveFilterCount()})`}
        </button>

        <button
          onClick={handleNearestToMe}
          disabled={locationLoading}
          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            sortBy === 'nearest'
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${locationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Navigation className="h-4 w-4" />
          {locationLoading ? 'Locating...' : 'Nearest to Me'}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Main Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity Level
              </label>
              <div className="flex flex-wrap gap-2">
                {severityOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('severity', option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                      filters.severity === option.value
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm'
                    }`}
                  >
                    <span className={`font-semibold ${option.color}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Damage Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Damage Type
              </label>
              <div className="flex flex-wrap gap-2">
                {propertyTypeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('propertyType', option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 ${
                      filters.propertyType === option.value
                        ? 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range & Has Photo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {dateRangeOptions.map(option => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange('dateRange', option.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 ${
                          filters.dateRange === option.value
                            ? 'bg-purple-50 text-purple-700 border-2 border-purple-500'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Has Photo Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media Content
                </label>
                <button
                  onClick={() => handleFilterChange('hasPhoto', !filters.hasPhoto)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    filters.hasPhoto
                      ? 'bg-green-50 text-green-700 border-2 border-green-500'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm'
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  <span>Has Photos</span>
                  {filters.hasPhoto && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                      ✓
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Sorting Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map(option => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 flex-shrink-0 ${
                        sortBy === option.value
                          ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-500'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm'
                      } ${option.value === 'nearest' && !userLocation ? 'relative' : ''}`}
                    >
                      {typeof Icon === 'string' ? (
                        <span className="text-lg">{Icon}</span>
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      {option.label}
                      {option.value === 'nearest' && !userLocation && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {filters.severity !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                    Severity: {severityOptions.find(s => s.value === filters.severity)?.label}
                  </span>
                )}
                {filters.propertyType !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Type: {propertyTypeOptions.find(p => p.value === filters.propertyType)?.label}
                  </span>
                )}
                {filters.dateRange !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    Date: {dateRangeOptions.find(d => d.value === filters.dateRange)?.label}
                  </span>
                )}
                {filters.hasPhoto && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Has Photos
                  </span>
                )}
                {filters.search && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                    Search: "{filters.search.substring(0, 20)}..."
                  </span>
                )}
                {sortBy !== 'newest' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Sort: {sortOptions.find(s => s.value === sortBy)?.label}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Location Status */}
      {userLocation && (
        <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Using your location for distance calculations</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DamageFilters