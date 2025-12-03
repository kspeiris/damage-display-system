import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDamage } from '../../context/DamageContext'
import { 
  Home, 
  Building, 
  Map, 
  Sprout, 
  Factory, 
  Church, 
  School, 
  Wrench,
  Flame,
  Droplets,
  Navigation,
  BarChart2,
  ChevronRight,
  X,
  PieChart,
  TrendingUp
} from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const DamageTypeChart = () => {
  const { stats, damages } = useDamage()
  const [selectedType, setSelectedType] = useState(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [drillDownData, setDrillDownData] = useState([])

  // Install recharts if not already: npm install recharts

  // Safely access stats with defaults
  const safeStats = stats || {}
  const byType = safeStats.byType || {}

  // Damage type configuration with custom colors
  const damageTypeConfig = {
    structural: {
      label: 'Structural',
      icon: Building,
      color: '#3B82F6', // Blue-500
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      description: 'Building integrity damage'
    },
    flooding: {
      label: 'Flooding',
      icon: Droplets,
      color: '#06B6D4', // Cyan-500
      lightColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-700',
      description: 'Water damage and inundation'
    },
    landslide: {
      label: 'Landslide',
      icon: Navigation,
      color: '#F59E0B', // Amber-500
      lightColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      description: 'Soil movement and erosion'
    },
    fire: {
      label: 'Fire',
      icon: Flame,
      color: '#EF4444', // Red-500
      lightColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      description: 'Burn and smoke damage'
    },
    road: {
      label: 'Road/Bridge',
      icon: Map,
      color: '#8B5CF6', // Violet-500
      lightColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      textColor: 'text-violet-700',
      description: 'Transport infrastructure'
    },
    utility: {
      label: 'Utility',
      icon: Wrench,
      color: '#6366F1', // Indigo-500
      lightColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700',
      description: 'Power and water systems'
    },
    agricultural: {
      label: 'Agricultural',
      icon: Sprout,
      color: '#10B981', // Emerald-500
      lightColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      description: 'Crop and farm damage'
    },
    residential: {
      label: 'Residential',
      icon: Home,
      color: '#8B5CF6', // Violet-500
      lightColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      textColor: 'text-violet-700',
      description: 'Houses and apartments'
    },
    commercial: {
      label: 'Commercial',
      icon: Building,
      color: '#3B82F6', // Blue-500
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      description: 'Offices and shops'
    },
    industrial: {
      label: 'Industrial',
      icon: Factory,
      color: '#F97316', // Orange-500
      lightColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      description: 'Factories and warehouses'
    },
    religious: {
      label: 'Religious',
      icon: Church,
      color: '#EC4899', // Pink-500
      lightColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-700',
      description: 'Temples and churches'
    },
    public: {
      label: 'Public',
      icon: School,
      color: '#14B8A6', // Teal-500
      lightColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-700',
      description: 'Schools and hospitals'
    }
  }

  // Prepare chart data
  const typeData = Object.entries(byType)
    .filter(([key]) => damageTypeConfig[key])
    .map(([key, value]) => ({
      name: damageTypeConfig[key].label,
      value: value || 0,
      type: key,
      color: damageTypeConfig[key].color,
      icon: damageTypeConfig[key].icon,
      ...damageTypeConfig[key]
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = typeData.reduce((sum, item) => sum + item.value, 0)

  // Animation progress
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Handle drill-down
  const handleTypeClick = (type) => {
    if (!type || !damages) return
    
    setSelectedType(type)
    
    // Filter damages by selected type
    const filteredDamages = damages.filter(damage => 
      damage.damageType === type.type || damage.propertyType === type.type
    ).slice(0, 5) // Limit to 5 for display
    
    setDrillDownData(filteredDamages)
    setShowDetails(true)
  }

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-semibold text-gray-900">{data.name}</span>
          </div>
          <div className="text-sm">
            <div className="text-gray-900 font-bold">{data.value} reports</div>
            <div className="text-gray-600">
              {total > 0 ? ((data.value / total) * 100).toFixed(1) : 0}% of total
            </div>
            <div className="text-gray-500 text-xs mt-1">{data.description}</div>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom legend
  const renderLegend = (props) => {
    const { payload } = props
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.map((entry, index) => {
          const Icon = typeData.find(t => t.name === entry.value)?.icon || BarChart2
          return (
            <motion.div
              key={`legend-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                const type = typeData.find(t => t.name === entry.value)
                if (type) handleTypeClick(type)
              }}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                hover:shadow-md transition-all duration-200
                ${typeData.find(t => t.name === entry.value)?.lightColor || 'bg-gray-50'}
                border ${typeData.find(t => t.name === entry.value)?.borderColor || 'border-gray-200'}
                hover:scale-105 active:scale-95
              `}
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <Icon className="h-4 w-4" style={{ color: entry.color }} />
              <span className="text-sm font-medium text-gray-700">{entry.value}</span>
              <span className="text-xs text-gray-500">
                ({typeData.find(t => t.name === entry.value)?.value || 0})
              </span>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Damage Type Analysis</h3>
            </div>
            <p className="text-sm text-gray-500">Click any segment to view details</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              {total} Total
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Donut Chart */}
          <div className="relative">
            <div className="h-64 md:h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  {/* Donut Hole */}
                  <Pie
                    data={[{ value: 100 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="70%"
                    fill="#F3F4F6"
                    dataKey="value"
                  />
                  
                  {/* Main Pie */}
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    onClick={(data) => handleTypeClick(data)}
                    className="cursor-pointer"
                  >
                    {typeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={renderLegend} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            {/* Center label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="bg-white rounded-full p-4 shadow-lg"
              >
                <div className="text-2xl font-bold text-gray-900">{total}</div>
                <div className="text-xs text-gray-500">Total Reports</div>
                <div className="text-xs text-blue-600 font-medium mt-1">
                  {typeData.length} Types
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right: Type Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 mb-4">Type Breakdown</h4>
            <div className="space-y-3">
              {typeData.map((type, index) => {
                const Icon = type.icon
                const percentage = total > 0 ? (type.value / total) * 100 : 0
                
                return (
                  <motion.div
                    key={type.type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    onClick={() => handleTypeClick(type)}
                    className={`
                      p-4 rounded-xl border cursor-pointer
                      transition-all duration-200 hover:shadow-lg
                      ${type.lightColor} ${type.borderColor}
                      hover:scale-[1.02] active:scale-[0.98]
                      ${selectedType?.type === type.type ? 'ring-2 ring-offset-2' : ''}
                    `}
                    style={{
                      '--ring-color': type.color
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg`} style={{ backgroundColor: type.color + '20' }}>
                          <Icon className="h-5 w-5" style={{ color: type.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{type.name}</span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{type.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{type.value}</div>
                        <div className="text-sm font-medium" style={{ color: type.color }}>
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Distribution</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {typeData.length}
                </div>
                <div className="text-sm text-blue-600 font-medium">Damage Types</div>
                <div className="text-xs text-blue-500 mt-1">Active categories</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-700">
                  {typeData[0]?.value || 0}
                </div>
                <div className="text-sm text-green-600 font-medium">Most Common</div>
                <div className="text-xs text-green-500 mt-1 truncate">
                  {typeData[0]?.name || 'None'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Note */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Click any damage type to view detailed reports</span>
          </div>
        </div>
      </motion.div>

      {/* Drill-down Modal */}
      <AnimatePresence>
        {showDetails && selectedType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div 
                className="p-6 border-b"
                style={{ 
                  backgroundColor: selectedType.color + '10',
                  borderColor: selectedType.color + '30'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: selectedType.color + '20' }}>
                      {selectedType.icon && (
                        <selectedType.icon className="h-6 w-6" style={{ color: selectedType.color }} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedType.name} Damage</h3>
                      <p className="text-gray-600">{selectedType.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{selectedType.value}</div>
                    <div className="text-sm text-gray-600">Total Reports</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">
                      {total > 0 ? ((selectedType.value / total) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Of All Damage</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">
                      {typeData.findIndex(t => t.type === selectedType.type) + 1}
                    </div>
                    <div className="text-sm text-gray-600">Rank</div>
                  </div>
                </div>

                {drillDownData.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 mb-2">Recent Reports</h4>
                    {drillDownData.map((damage, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{damage.description?.substring(0, 60)}...</p>
                            <p className="text-sm text-gray-500">
                              Severity: <span className="font-medium capitalize">{damage.severity}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(damage.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <BarChart2 className="h-12 w-12 mx-auto mb-3" />
                    <p>No detailed reports available for this type</p>
                    <p className="text-sm mt-1">Submit a report to see details here</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DamageTypeChart