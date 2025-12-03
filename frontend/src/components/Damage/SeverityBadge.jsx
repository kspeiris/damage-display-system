import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Flame, CheckCircle, AlertCircle, Skull } from 'lucide-react'

const SeverityBadge = ({ severity, size = 'md', showIcon = true, pulseCritical = true }) => {
  // Safe severity handling
  const safeSeverity = severity?.toLowerCase() || 'minor'
  
  const getSeverityConfig = (sev) => {
    const config = {
      minor: {
        label: 'Minor',
        color: 'bg-green-100 text-green-800 border-green-300',
        glow: 'shadow-green-200',
        icon: <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />,
        emoji: '🟢',
        description: 'Low impact'
      },
      moderate: {
        label: 'Moderate',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        glow: 'shadow-orange-200',
        icon: <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />,
        emoji: '🟠',
        description: 'Moderate impact'
      },
      severe: {
        label: 'Severe',
        color: 'bg-red-100 text-red-800 border-red-300',
        glow: 'shadow-red-200',
        icon: <Flame className="h-3 w-3 md:h-4 md:w-4" />,
        emoji: '🔴',
        description: 'High impact'
      },
      critical: {
        label: 'Critical',
        color: 'bg-red-500/10 text-red-700 border-red-500/30',
        glow: 'shadow-red-500/30',
        icon: <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />,
        emoji: '⚠️',
        description: 'Emergency'
      },
      destroyed: {
        label: 'Destroyed',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        glow: 'shadow-purple-200',
        icon: <Skull className="h-3 w-3 md:h-4 md:w-4" />,
        emoji: '💀',
        description: 'Total loss'
      }
    }
    return config[sev] || config.minor
  }

  const config = getSeverityConfig(safeSeverity)
  
  // Size configurations with safe fallback
  const sizeConfig = {
    xs: {
      padding: 'px-2 py-0.5',
      text: 'text-xs',
      iconSize: 'h-2.5 w-2.5',
      gap: 'gap-1'
    },
    sm: {
      padding: 'px-2.5 py-1',
      text: 'text-xs',
      iconSize: 'h-3 w-3',
      gap: 'gap-1'
    },
    md: {
      padding: 'px-3 py-1',
      text: 'text-sm',
      iconSize: 'h-3.5 w-3.5',
      gap: 'gap-1.5'
    },
    lg: {
      padding: 'px-4 py-1.5',
      text: 'text-base',
      iconSize: 'h-4 w-4',
      gap: 'gap-2'
    },
    xl: {
      padding: 'px-5 py-2',
      text: 'text-lg',
      iconSize: 'h-5 w-5',
      gap: 'gap-2.5'
    },
    // Aliases for backward compatibility
    small: {
      padding: 'px-2.5 py-1',
      text: 'text-xs',
      iconSize: 'h-3 w-3',
      gap: 'gap-1'
    },
    medium: {
      padding: 'px-3 py-1',
      text: 'text-sm',
      iconSize: 'h-3.5 w-3.5',
      gap: 'gap-1.5'
    },
    large: {
      padding: 'px-4 py-1.5',
      text: 'text-base',
      iconSize: 'h-4 w-4',
      gap: 'gap-2'
    }
  }

  // Safe size handling with fallback to 'md'
  const safeSize = sizeConfig[size] ? size : 'md'
  const { padding, text, iconSize, gap } = sizeConfig[safeSize]

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`
        inline-flex items-center ${padding} rounded-full font-medium border 
        ${config.color} ${config.glow} ${text} ${gap}
        transition-all duration-200 relative overflow-hidden
        ${safeSeverity === 'critical' && pulseCritical ? 'shadow-lg' : 'shadow-sm'}
        hover:shadow-md
      `}
    >
      {/* Glowing effect for Critical severity */}
      {safeSeverity === 'critical' && pulseCritical && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500/10"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </>
      )}

      {/* Pulse animation for all severities */}
      <motion.span
        className={`absolute -z-10 ${safeSeverity === 'critical' ? 'bg-red-500/20' : 
                   safeSeverity === 'severe' ? 'bg-red-500/10' :
                   safeSeverity === 'moderate' ? 'bg-orange-500/10' : 'bg-green-500/10'}`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Icon/Emoji */}
      {showIcon && (
        <motion.span
          whileHover={{ rotate: 5 }}
          className="flex items-center justify-center"
        >
          <span className="relative">
            {config.icon}
            <span className="absolute -top-1 -right-1 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
              {config.emoji}
            </span>
          </span>
        </motion.span>
      )}

      {/* Label */}
      <span className="font-semibold tracking-tight relative z-10">
        {config.label}
      </span>

      {/* Optional: Status dot */}
      <motion.span
        className={`w-1.5 h-1.5 rounded-full ${safeSeverity === 'critical' ? 'bg-red-500 animate-pulse' : 
                   safeSeverity === 'severe' ? 'bg-red-400' :
                   safeSeverity === 'moderate' ? 'bg-orange-400' : 'bg-green-400'}`}
        animate={safeSeverity === 'critical' ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1]
        } : {}}
        transition={safeSeverity === 'critical' ? {
          duration: 1,
          repeat: Infinity
        } : {}}
      />
    </motion.span>
  )
}

// Helper function for external use
const getSeverityConfig = (severity) => {
  const safeSeverity = severity?.toLowerCase() || 'minor'
  
  const config = {
    minor: {
      label: 'Minor',
      color: 'bg-green-100 text-green-800 border-green-300',
      glow: 'shadow-green-200',
      icon: <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />,
      emoji: '🟢',
      description: 'Low impact'
    },
    moderate: {
      label: 'Moderate',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      glow: 'shadow-orange-200',
      icon: <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />,
      emoji: '🟠',
      description: 'Moderate impact'
    },
    severe: {
      label: 'Severe',
      color: 'bg-red-100 text-red-800 border-red-300',
      glow: 'shadow-red-200',
      icon: <Flame className="h-3 w-3 md:h-4 md:w-4" />,
      emoji: '🔴',
      description: 'High impact'
    },
    critical: {
      label: 'Critical',
      color: 'bg-red-500/10 text-red-700 border-red-500/30',
      glow: 'shadow-red-500/30',
      icon: <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />,
      emoji: '⚠️',
      description: 'Emergency'
    },
    destroyed: {
      label: 'Destroyed',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      glow: 'shadow-purple-200',
      icon: <Skull className="h-3 w-3 md:h-4 md:w-4" />,
      emoji: '💀',
      description: 'Total loss'
    }
  }
  return config[safeSeverity] || config.minor
}

// Optional: Animated Severity Badge with tooltip
export const AnimatedSeverityBadge = ({ severity, showTooltip = true, size = 'md' }) => {
  const config = getSeverityConfig(severity)

  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <SeverityBadge severity={severity} size={size} />
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
          <div className="flex items-center gap-1">
            {config.icon}
            <span>{config.label} - {config.description}</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </motion.div>
  )
}

// Optional: Severity Indicator (Simpler version)
export const SeverityIndicator = ({ severity, size = 'md' }) => {
  const safeSeverity = severity?.toLowerCase() || 'minor'
  const config = getSeverityConfig(safeSeverity)
  
  const sizeMap = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
    // Aliases
    small: 'w-2.5 h-2.5',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  }

  const safeSize = sizeMap[size] || sizeMap.md

  return (
    <motion.div
      className={`${safeSize} rounded-full ${safeSeverity === 'critical' ? 'bg-red-500' : 
                 safeSeverity === 'severe' ? 'bg-red-400' :
                 safeSeverity === 'moderate' ? 'bg-orange-400' : 'bg-green-400'}`}
      animate={safeSeverity === 'critical' ? {
        scale: [1, 1.2, 1],
        boxShadow: [
          `0 0 0 0 ${safeSeverity === 'critical' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)'}`,
          `0 0 0 6px ${safeSeverity === 'critical' ? 'rgba(239, 68, 68, 0)' : 'rgba(34, 197, 94, 0)'}`,
          `0 0 0 0 ${safeSeverity === 'critical' ? 'rgba(239, 68, 68, 0)' : 'rgba(34, 197, 94, 0)'}`
        ]
      } : {}}
      transition={safeSeverity === 'critical' ? {
        duration: 2,
        repeat: Infinity
      } : {}}
      title={config.label}
    />
  )
}

export { getSeverityConfig }
export default SeverityBadge