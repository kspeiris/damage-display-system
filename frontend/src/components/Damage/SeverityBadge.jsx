import React from 'react'

const SeverityBadge = ({ severity }) => {
  const getSeverityConfig = (severity) => {
    const config = {
      minor: {
        label: 'Minor',
        color: 'bg-green-100 text-green-800 border-green-200',
        dot: 'bg-green-500'
      },
      moderate: {
        label: 'Moderate',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        dot: 'bg-yellow-500'
      },
      severe: {
        label: 'Severe',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        dot: 'bg-orange-500'
      },
      destroyed: {
        label: 'Destroyed',
        color: 'bg-red-100 text-red-800 border-red-200',
        dot: 'bg-red-500'
      }
    }
    return config[severity] || config.minor
  }

  const config = getSeverityConfig(severity)

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`}></span>
      {config.label}
    </span>
  )
}

export default SeverityBadge