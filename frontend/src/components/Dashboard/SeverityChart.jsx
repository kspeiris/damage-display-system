import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useDamage } from '../../context/DamageContext'
import { 
  AlertCircle, 
  AlertTriangle, 
  Flame, 
  CheckCircle,
  Skull,
  Info,
  AlertOctagon,
  TrendingUp,
  Activity
} from 'lucide-react'

const SeverityChart = () => {
  const { stats } = useDamage()
  const [activeSeverity, setActiveSeverity] = useState(null)

  const safeStats = stats || {}
  const bySeverity = safeStats.bySeverity || {}

  const severityData = [
    { 
      label: 'Minor', 
      value: bySeverity.minor || 0, 
      color: 'bg-green-400',
      borderColor: 'border-green-400',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      icon: CheckCircle,
      description: 'Minimal damage, cosmetic issues',
      level: 1,
      risk: 'Low'
    },
    { 
      label: 'Moderate', 
      value: bySeverity.moderate || 0, 
      color: 'bg-yellow-400',
      borderColor: 'border-yellow-400',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      icon: AlertCircle,
      description: 'Repairable damage, some functionality lost',
      level: 2,
      risk: 'Medium'
    },
    { 
      label: 'Severe', 
      value: bySeverity.severe || 0, 
      color: 'bg-orange-400',
      borderColor: 'border-orange-400',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      icon: AlertTriangle,
      description: 'Extensive damage, major repairs needed',
      level: 3,
      risk: 'High'
    },
    { 
      label: 'Critical', 
      value: bySeverity.critical || 0, 
      color: 'bg-red-500',
      borderColor: 'border-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      icon: Flame,
      description: 'Immediate danger, evacuation required',
      level: 4,
      risk: 'Critical'
    },
    { 
      label: 'Destroyed', 
      value: bySeverity.destroyed || 0, 
      color: 'bg-purple-500',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      icon: Skull,
      description: 'Total loss, complete destruction',
      level: 5,
      risk: 'Extreme'
    }
  ]

  const total = severityData.reduce((sum, item) => sum + item.value, 0) || 1
  const maxValue = Math.max(...severityData.map(d => d.value))

  // Calculate summary metrics
  const highPriorityCount = severityData
    .filter(item => item.level >= 4)
    .reduce((sum, item) => sum + item.value, 0)
  
  const weightedSum = severityData.reduce((sum, item) => 
    sum + (item.value * item.level), 0)
  
  const averageSeverity = total > 0 ? (weightedSum / total) : 0
  
  const highestSeverity = severityData.reduce((max, item) => 
    item.value > max.value ? item : max, severityData[0])
  
  const lowestSeverity = severityData.reduce((min, item) => 
    item.value < min.value ? item : min, severityData[0])

  // Calculate severity distribution for pie chart visualization
  const pieSegments = severityData.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }))

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Damage Severity Overview</h3>
              <p className="text-gray-500 mt-1">
                Monitoring {total} incident{total !== 1 ? 's' : ''} across 5 severity levels
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <div className="text-sm text-gray-500">Last Updated</div>
            <div className="text-sm font-medium text-gray-900">Just now</div>
          </div>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-700">{total}</div>
              <div className="text-sm font-medium text-blue-800 mt-1">Total Reports</div>
            </div>
            <div className="p-2 bg-white rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-300">
            <div className="text-xs text-blue-700">
              Across all severity levels
            </div>
          </div>
        </motion.div>

        {/* High Priority */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-700">{highPriorityCount}</div>
              <div className="text-sm font-medium text-red-800 mt-1">High Priority</div>
            </div>
            <div className="p-2 bg-white rounded-lg">
              <AlertOctagon className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-red-300">
            <div className="text-xs text-red-700">
              {total > 0 ? ((highPriorityCount / total) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
        </motion.div>

        {/* Average Severity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-700">{averageSeverity.toFixed(1)}</div>
              <div className="text-sm font-medium text-orange-800 mt-1">Avg. Severity</div>
            </div>
            <div className="p-2 bg-white rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-orange-300">
            <div className="flex items-center justify-between text-xs text-orange-700">
              <span>Scale: 1-5</span>
              <span className={`font-semibold ${
                averageSeverity >= 4 ? 'text-red-600' :
                averageSeverity >= 3 ? 'text-orange-600' :
                averageSeverity >= 2 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {averageSeverity >= 4 ? 'Critical' :
                 averageSeverity >= 3 ? 'High Risk' :
                 averageSeverity >= 2 ? 'Medium Risk' : 'Low Risk'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Most Common */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">{highestSeverity.value}</div>
              <div className="text-sm font-medium text-gray-800 mt-1">Most Common</div>
            </div>
            <div className={`p-2 rounded-lg ${highestSeverity.bgColor}`}>
              <highestSeverity.icon className={`h-5 w-5 ${highestSeverity.textColor}`} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-300">
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${highestSeverity.color}`}></div>
              <span className={`font-semibold ${highestSeverity.textColor}`}>
                {highestSeverity.label}
              </span>
              <span className="text-gray-500">
                ({total > 0 ? ((highestSeverity.value / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Severity Breakdown */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-gray-900">Severity Distribution</h4>
              <div className="text-sm text-gray-500">
                Sorted by severity level
              </div>
            </div>

            <div className="space-y-4">
              {severityData.map((item, index) => {
                const Icon = item.icon
                const percentage = total > 0 ? (item.value / total) * 100 : 0
                const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0
                
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onMouseEnter={() => setActiveSeverity(item.label)}
                    onMouseLeave={() => setActiveSeverity(null)}
                    className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      activeSeverity === item.label 
                        ? `${item.bgColor} border-2 ${item.borderColor} shadow-sm` 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${item.bgColor}`}>
                          <Icon className={`h-5 w-5 ${item.textColor}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className={`font-bold text-lg ${item.textColor}`}>
                              {item.label}
                            </h5>
                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              Level {item.level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{item.value}</div>
                        <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    
                    {/* Bar with labels */}
                    <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                        className={`h-full ${item.color} rounded-full relative`}
                      >
                        {/* Gradient overlay for better visibility */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                        
                        {/* Value inside bar */}
                        {barWidth > 30 && (
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-white">
                            {item.value} reports
                          </span>
                        )}
                      </motion.div>
                      
                      {/* Value outside bar */}
                      {barWidth <= 30 && item.value > 0 && (
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-700">
                          {item.value} reports
                        </span>
                      )}
                    </div>
                    
                    {/* Risk indicator */}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        Risk Level: <span className="font-semibold">{item.risk}</span>
                      </span>
                      <span className="text-gray-500">
                        Relative: {barWidth.toFixed(1)}% of max
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Insights Panel */}
        <div className="space-y-6">
          {/* Risk Assessment */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white">
            <h4 className="font-bold text-white mb-4">Risk Assessment</h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Overall Risk Level</span>
                  <span className={`font-bold ${
                    averageSeverity >= 4 ? 'text-red-400' :
                    averageSeverity >= 3 ? 'text-orange-400' :
                    averageSeverity >= 2.5 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {averageSeverity >= 4 ? 'CRITICAL' :
                     averageSeverity >= 3 ? 'HIGH' :
                     averageSeverity >= 2.5 ? 'ELEVATED' : 'MODERATE'}
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(averageSeverity / 5) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full ${
                      averageSeverity >= 4 ? 'bg-red-500' :
                      averageSeverity >= 3 ? 'bg-orange-500' :
                      averageSeverity >= 2.5 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{highPriorityCount}</div>
                  <div className="text-xs text-red-300">Urgent Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {severityData.find(d => d.level === 3)?.value || 0}
                  </div>
                  <div className="text-xs text-orange-300">Severe Cases</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-300 mb-2">Recommendation:</div>
                <div className="text-sm font-medium">
                  {averageSeverity >= 4 ? 'Immediate action required. Deploy emergency teams.' :
                   averageSeverity >= 3 ? 'Prioritize high-severity cases. Schedule inspections.' :
                   averageSeverity >= 2.5 ? 'Monitor closely. Address moderate+ cases first.' :
                   'Standard monitoring. Focus on preventive measures.'}
                </div>
              </div>
            </div>
          </div>

          {/* Severity Proportions */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4">Proportion Analysis</h4>
            
            <div className="space-y-4">
              {pieSegments.map((item, index) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-right w-16">
                      <div className="text-sm font-bold text-gray-900">
                        {item.percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">{item.value}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Stats summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Majority Category</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${highestSeverity.color}`}></div>
                      <span className="text-sm font-semibold text-gray-900">
                        {highestSeverity.label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Minority Category</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${lowestSeverity.color}`}></div>
                      <span className="text-sm font-semibold text-gray-900">
                        {lowestSeverity.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
            <h4 className="font-bold text-blue-900 mb-4">Quick Stats</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-blue-700">{total}</div>
                <div className="text-sm text-blue-800 mt-1">Total Incidents</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-700">{severityData.length}</div>
                <div className="text-sm text-blue-800 mt-1">Severity Levels</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-300">
              <div className="text-sm text-blue-800">
                <div className="flex items-center justify-between">
                  <span>Data Freshness:</span>
                  <span className="font-semibold">Real-time</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Update Frequency:</span>
                  <span className="font-semibold">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Severity Scale Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-900">Severity Scale Reference</h4>
          <div className="text-sm text-gray-500">
            Click any level for details
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {severityData.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveSeverity(item.label)}
              className={`
                p-4 rounded-xl border text-center transition-all duration-200
                ${activeSeverity === item.label 
                  ? `${item.bgColor} border-2 ${item.borderColor} shadow-sm transform scale-105` 
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h5 className={`font-bold ${item.textColor}`}>{item.label}</h5>
                  <div className="text-xs text-gray-600 mt-1">Level {item.level}</div>
                  <div className="text-xs font-medium text-gray-900 mt-1">
                    {item.value} report{item.value !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SeverityChart