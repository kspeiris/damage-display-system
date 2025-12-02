import React from 'react'
import { motion } from 'framer-motion'
import { useDamage } from '../../context/DamageContext'
import { Home, Building, Map, Sprout } from 'lucide-react'

const DamageTypeChart = () => {
  const { stats } = useDamage()

  // Safely access stats with defaults
  const safeStats = stats || {}
  const byType = safeStats.byType || {}

  const typeData = [
    { label: 'Residential', value: byType.residential || 0, icon: Home, color: 'bg-blue-500' },
    { label: 'Commercial', value: byType.commercial || 0, icon: Building, color: 'bg-purple-500' },
    { label: 'Infrastructure', value: byType.infrastructure || 0, icon: Map, color: 'bg-orange-500' },
    { label: 'Agricultural', value: byType.agricultural || 0, icon: Sprout, color: 'bg-green-500' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Damage by Type</h3>
      <div className="space-y-4">
        {typeData.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-gray-700">{item.label}</span>
              </div>
              <span className="font-bold text-gray-900">{item.value}</span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default DamageTypeChart