import React from 'react'
import { motion } from 'framer-motion'
import { useDamage } from '../../context/DamageContext'

const SeverityChart = () => {
  const { stats } = useDamage()

  // Safely access stats with defaults
  const safeStats = stats || {}
  const bySeverity = safeStats.bySeverity || {}

  const severityData = [
    { label: 'Minor', value: bySeverity.minor || 0, color: 'bg-green-500' },
    { label: 'Moderate', value: bySeverity.moderate || 0, color: 'bg-yellow-500' },
    { label: 'Severe', value: bySeverity.severe || 0, color: 'bg-orange-500' },
    { label: 'Destroyed', value: bySeverity.destroyed || 0, color: 'bg-red-500' }
  ]

  const total = severityData.reduce((sum, item) => sum + item.value, 0)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Damage Severity</h3>
      <div className="space-y-3">
        {severityData.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1 }}
                    className={`h-2 rounded-full ${item.color}`}
                  ></motion.div>
                </div>
                <span className="text-sm text-gray-600 w-8">{item.value}</span>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default SeverityChart