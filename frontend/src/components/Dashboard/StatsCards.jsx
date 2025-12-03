import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDamage } from '../../context/DamageContext'
import { 
  AlertTriangle, 
  MapPin, 
  TrendingUp, 
  Clock,
  BarChart3,
  ShieldAlert,
  Flame,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Target,
  Users,
  CheckCircle
} from 'lucide-react'
import CountUp from 'react-countup'

const StatsCards = () => {
  const { stats } = useDamage()
  const [prevStats, setPrevStats] = useState({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (stats && Object.keys(stats).length > 0) {
      setPrevStats(stats)
    }
  }, [stats])

  const safeStats = stats || {}
  const prevSafeStats = prevStats || {}
  const bySeverity = safeStats.bySeverity || {}
  const prevBySeverity = prevSafeStats.bySeverity || {}

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? `+${current}` : '0'
    const change = current - previous
    return change > 0 ? `+${change}` : change < 0 ? `${change}` : '0'
  }

  const getChangeColor = (current, previous) => {
    if (!previous) return 'text-green-600'
    const change = current - previous
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-500' : 'text-gray-500'
  }

  const getChangeIcon = (current, previous) => {
    if (!previous) return <ArrowUpRight className="h-3 w-3" />
    const change = current - previous
    return change > 0 
      ? <ArrowUpRight className="h-3 w-3" /> 
      : change < 0 
        ? <ArrowDownRight className="h-3 w-3" />
        : null
  }

  const cardData = [
    {
      title: 'Total Reports',
      value: safeStats.total || 0,
      previousValue: prevSafeStats.total || 0,
      icon: FileText,
      iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100',
      glowColor: 'rgba(59, 130, 246, 0.1)',
      description: 'All damage reports',
      gradient: 'from-blue-50/50 to-white',
      themeColor: 'blue'
    },
    {
      title: 'Critical Reports',
      value: (bySeverity.critical || 0) + (bySeverity.destroyed || 0) + (bySeverity.severe || 0),
      previousValue: (prevBySeverity.critical || 0) + (prevBySeverity.destroyed || 0) + (prevBySeverity.severe || 0),
      icon: ShieldAlert,
      iconBg: 'bg-gradient-to-br from-red-100 to-red-200',
      iconColor: 'text-red-600',
      borderColor: 'border-red-100',
      glowColor: 'rgba(239, 68, 68, 0.1)',
      description: 'Require immediate action',
      gradient: 'from-red-50/50 to-white',
      themeColor: 'red'
    },
    {
      title: 'Last 24 Hours',
      value: safeStats.last24h || 0,
      previousValue: prevSafeStats.last24h || 0,
      icon: Clock,
      iconBg: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
      glowColor: 'rgba(5, 150, 105, 0.1)',
      description: 'New reports today',
      gradient: 'from-emerald-50/50 to-white',
      themeColor: 'emerald'
    },
    {
      title: 'Areas Affected',
      value: safeStats.areasAffected || (safeStats.total > 0 ? Math.min(5, safeStats.total) : 0),
      previousValue: prevSafeStats.areasAffected || (prevSafeStats.total > 0 ? Math.min(5, prevSafeStats.total) : 0),
      icon: MapPin,
      iconBg: 'bg-gradient-to-br from-violet-100 to-violet-200',
      iconColor: 'text-violet-600',
      borderColor: 'border-violet-100',
      glowColor: 'rgba(139, 92, 246, 0.1)',
      description: 'Different locations',
      gradient: 'from-violet-50/50 to-white',
      themeColor: 'violet'
    }
  ]

  // Additional metrics with lighter colors
  const animatedMetrics = [
    {
      label: 'Response Rate',
      value: '92',
      unit: '%',
      icon: Target,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Verification Rate',
      value: '87',
      unit: '%',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Active Incidents',
      value: safeStats.active || 0,
      unit: '',
      icon: Activity,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardData.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                y: -4,
                boxShadow: `0 20px 40px -15px ${card.glowColor}`,
                transition: { duration: 0.2 }
              }}
              className={`
                relative rounded-2xl border ${card.borderColor} p-5
                bg-gradient-to-br ${card.gradient}
                shadow-sm hover:shadow-xl transition-all duration-300
                overflow-hidden group backdrop-blur-sm
              `}
            >
              {/* Subtle gradient accent */}
              <div className="absolute top-0 right-0 w-32 h-32 -translate-y-16 translate-x-16 opacity-10">
                <div className={`w-full h-full bg-gradient-to-br from-${card.themeColor}-300 to-${card.themeColor}-500 rounded-full blur-2xl`} />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {/* Title */}
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {card.title}
                    </p>
                    
                    {/* Animated Counter */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <CountUp
                        start={card.previousValue}
                        end={card.value}
                        duration={2}
                        separator=","
                        decimals={0}
                        className="text-2xl lg:text-3xl font-bold text-gray-900"
                      />
                      
                      {/* Change Indicator */}
                      {card.change !== '0' && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getChangeColor(card.value, card.previousValue).replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100')} ${getChangeColor(card.value, card.previousValue)}`}>
                          {getChangeIcon(card.value, card.previousValue)}
                          <span>{calculateChange(card.value, card.previousValue)}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-500">
                      {card.description}
                    </p>
                  </div>

                  {/* Icon Container */}
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className={`
                      p-2.5 rounded-lg ${card.iconBg}
                      shadow-sm group-hover:shadow-md
                      transition-all duration-300
                    `}
                  >
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </motion.div>
                </div>

                {/* Progress indicator */}
                <div className="mt-3">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r from-${card.themeColor}-300 to-${card.themeColor}-400`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.round((card.value / 50) * 100))}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Additional Metrics - Lighter Design */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {animatedMetrics.map((metric, index) => {
          const MetricIcon = metric.icon
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`${metric.bgColor} rounded-xl p-4 border border-transparent hover:border-${metric.iconColor.replace('text-', '')}/20 transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${metric.iconColor.replace('text-', 'bg-')}/10`}>
                  <MetricIcon className={`h-4 w-4 ${metric.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <div className="flex items-baseline gap-1">
                    <CountUp
                      start={0}
                      end={metric.value}
                      duration={1.5}
                      decimals={metric.unit === '%' ? 0 : 0}
                      className="text-lg font-semibold text-gray-900"
                    />
                    <span className="text-sm text-gray-500">{metric.unit}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Severity Breakdown - Light Version */}
      {bySeverity && Object.keys(bySeverity).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Severity Breakdown</h3>
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
              Real-time
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(bySeverity).map(([severity, count], index) => (
              <motion.div
                key={severity}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-lg font-bold text-gray-900">{count}</div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                  severity === 'critical' ? 'bg-red-100 text-red-700' :
                  severity === 'severe' ? 'bg-orange-100 text-orange-700' :
                  severity === 'moderate' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {severity}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Update Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center justify-center gap-2 text-xs text-gray-500"
      >
        <div className="flex items-center gap-1">
          <motion.div
            className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity 
            }}
          />
          <span>Live updates</span>
        </div>
        <span className="text-gray-400">•</span>
        <span>Last updated: Just now</span>
      </motion.div>
    </div>
  )
}

export default StatsCards