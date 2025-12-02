import React from 'react'
import { motion } from 'framer-motion'
import { useDamage } from '../../context/DamageContext'
import { AlertTriangle, MapPin, TrendingUp, Clock } from 'lucide-react'

const StatsCards = () => {
  const { stats } = useDamage()

  // Safely access stats with defaults
  const safeStats = stats || {}
  const bySeverity = safeStats.bySeverity || {}
  
  const cardData = [
    {
      title: 'Total Reports',
      value: safeStats.total || 0,
      icon: AlertTriangle,
      color: 'bg-blue-500',
      change: '+0'
    },
    {
      title: 'High Severity',
      value: (bySeverity.severe || 0) + (bySeverity.destroyed || 0),
      icon: TrendingUp,
      color: 'bg-red-500',
      change: '+0'
    },
    {
      title: 'Last 24h',
      value: safeStats.last24h || 0,
      icon: Clock,
      color: 'bg-green-500',
      change: '+0'
    },
    {
      title: 'Areas Affected',
      value: 5, // Hardcoded for now
      icon: MapPin,
      color: 'bg-purple-500',
      change: '+0'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardData.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <span className="text-xs text-green-600 font-medium">{card.change}</span>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default StatsCards