import React from 'react'
import { motion } from 'framer-motion'
import { 
  ZoomIn, 
  ZoomOut, 
  Navigation, 
  Target,
  Layers
} from 'lucide-react'

const MapControls = ({ 
  onZoomIn, 
  onZoomOut, 
  onLocate,
  onToggleLayers,
  currentLayer = 'markers',
  showHeatmap = false
}) => {
  const controls = [
    {
      icon: ZoomIn,
      onClick: onZoomIn,
      label: 'Zoom in',
      color: 'bg-white'
    },
    {
      icon: ZoomOut,
      onClick: onZoomOut,
      label: 'Zoom out',
      color: 'bg-white'
    },
    {
      icon: Target,
      onClick: onLocate,
      label: 'My location',
      color: 'bg-primary-500 text-white'
    },
    {
      icon: Layers,
      onClick: onToggleLayers,
      label: showHeatmap ? 'Show markers' : 'Show heatmap',
      color: showHeatmap ? 'bg-orange-500 text-white' : 'bg-white'
    }
  ]

  return (
    <div className="absolute top-4 right-4 z-[1000] space-y-2">
      {controls.map((control, index) => {
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
  )
}

export default MapControls