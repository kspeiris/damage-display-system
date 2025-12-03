import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ZoomIn, 
  ZoomOut, 
  Target,
  Layers,
  Map,
  Satellite,
  Filter,
  X,
  Info,
  RefreshCw
} from 'lucide-react'

const MapControls = ({ 
  onZoomIn, 
  onZoomOut,
  onResetZoom,
  onLocate,
  onToggleLayers,
  onToggleMapType,
  onSeverityFilter,
  currentLayer = 'markers',
  currentMapType = 'normal',
  showHeatmap = false,
  severityFilters = ['low', 'medium', 'high', 'critical'], // Active filters
  availableSeverities = ['low', 'medium', 'high', 'critical']
}) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showLegendPanel, setShowLegendPanel] = useState(false)
  
  // Define severity colors and labels
  const severityConfig = {
    low: { color: '#10B981', label: 'Low', description: 'Minor issues' },
    medium: { color: '#F59E0B', label: 'Medium', description: 'Moderate issues' },
    high: { color: '#EF4444', label: 'High', description: 'Serious issues' },
    critical: { color: '#7C3AED', label: 'Critical', description: 'Emergency issues' }
  }
  
  const mapTypeConfig = {
    normal: { icon: Map, label: 'Normal', color: 'bg-blue-500' },
    satellite: { icon: Satellite, label: 'Satellite', color: 'bg-green-500' }
  }
  
  const baseControls = [
    {
      icon: ZoomIn,
      onClick: onZoomIn,
      label: 'Zoom in',
      color: 'bg-white hover:bg-gray-50'
    },
    {
      icon: ZoomOut,
      onClick: onZoomOut,
      label: 'Zoom out',
      color: 'bg-white hover:bg-gray-50'
    },
    {
      icon: RefreshCw,
      onClick: onResetZoom,
      label: 'Reset zoom',
      color: 'bg-white hover:bg-gray-50'
    },
    {
      icon: Target,
      onClick: onLocate,
      label: 'Locate me',
      color: 'bg-primary-500 text-white hover:bg-primary-600'
    },
    {
      icon: mapTypeConfig[currentMapType].icon,
      onClick: onToggleMapType,
      label: `Switch to ${currentMapType === 'normal' ? 'satellite' : 'normal'} view`,
      color: mapTypeConfig[currentMapType].color + ' text-white hover:opacity-90'
    },
    {
      icon: Layers,
      onClick: onToggleLayers,
      label: showHeatmap ? 'Show markers' : 'Show heatmap',
      color: showHeatmap ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white hover:bg-gray-50'
    },
    {
      icon: Filter,
      onClick: () => setShowFilterPanel(!showFilterPanel),
      label: 'Filter by severity',
      color: severityFilters.length < availableSeverities.length 
        ? 'bg-purple-500 text-white hover:bg-purple-600' 
        : 'bg-white hover:bg-gray-50'
    },
    {
      icon: Info,
      onClick: () => setShowLegendPanel(!showLegendPanel),
      label: 'Show legend',
      color: 'bg-white hover:bg-gray-50'
    }
  ]

  const handleSeverityToggle = (severity) => {
    const newFilters = severityFilters.includes(severity)
      ? severityFilters.filter(s => s !== severity)
      : [...severityFilters, severity]
    
    if (onSeverityFilter) {
      onSeverityFilter(newFilters)
    }
  }

  return (
    <>
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        {baseControls.map((control, index) => {
          const Icon = control.icon
          return (
            <motion.button
              key={control.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={control.onClick}
              className={`${control.color} p-3 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all flex items-center justify-center`}
              title={control.label}
            >
              <Icon className="h-5 w-5" />
            </motion.button>
          )
        })}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 right-4 z-[999] bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Filter by Severity</h3>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {availableSeverities.map(severity => (
                <div key={severity} className="flex items-center">
                  <button
                    onClick={() => handleSeverityToggle(severity)}
                    className={`flex items-center w-full p-2 rounded hover:bg-gray-50 ${
                      !severityFilters.includes(severity) ? 'opacity-50' : ''
                    }`}
                  >
                    <div 
                      className="h-3 w-3 rounded-full mr-3"
                      style={{ backgroundColor: severityConfig[severity].color }}
                    />
                    <span className="text-sm font-medium capitalize">
                      {severityConfig[severity].label}
                    </span>
                    <span className="ml-auto text-xs text-gray-500">
                      {severityFilters.includes(severity) ? 'On' : 'Off'}
                    </span>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => {
                  if (onSeverityFilter) {
                    onSeverityFilter(availableSeverities)
                  }
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Show all severities
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend Panel */}
      <AnimatePresence>
        {showLegendPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-4 left-4 z-[999] bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Map Legend</h3>
              <button
                onClick={() => setShowLegendPanel(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Severity Colors</h4>
                <div className="space-y-2">
                  {Object.entries(severityConfig).map(([severity, config]) => (
                    <div key={severity} className="flex items-center">
                      <div 
                        className="h-4 w-4 rounded mr-3"
                        style={{ backgroundColor: config.color }}
                      />
                      <div>
                        <span className="text-sm font-medium capitalize">{config.label}</span>
                        <p className="text-xs text-gray-500">{config.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Map Types</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Map className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">Normal Map</span>
                  </div>
                  <div className="flex items-center">
                    <Satellite className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Satellite View</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Layers</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-orange-500 rounded mr-2" />
                    <span className="text-sm">Heatmap</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-primary-500 rounded mr-2" />
                    <span className="text-sm">Markers</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MapControls