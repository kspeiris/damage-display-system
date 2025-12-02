import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'

const TestConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    backend: 'testing',
    damages: 'testing',
    stats: 'testing'
  })
  const [loading, setLoading] = useState(true)
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000')

  const testConnection = async () => {
    setLoading(true)
    const status = {
      backend: 'testing',
      damages: 'testing',
      stats: 'testing'
    }
    setConnectionStatus(status)

    try {
      // Test backend health
      const healthRes = await fetch(`${backendUrl}/api/health`)
      if (healthRes.ok) {
        status.backend = 'connected'
      } else {
        status.backend = 'failed'
      }
      setConnectionStatus({...status})

      // Test damages endpoint
      const damagesRes = await fetch(`${backendUrl}/api/damages`)
      if (damagesRes.ok) {
        const data = await damagesRes.json()
        status.damages = `connected (${data.damages?.length || 0} reports)`
      } else {
        status.damages = 'failed'
      }
      setConnectionStatus({...status})

      // Test stats endpoint
      const statsRes = await fetch(`${backendUrl}/api/stats`)
      if (statsRes.ok) {
        status.stats = 'connected'
      } else {
        status.stats = 'failed'
      }
      setConnectionStatus({...status})

    } catch (error) {
      status.backend = 'failed'
      status.damages = 'failed'
      status.stats = 'failed'
      setConnectionStatus(status)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  const getStatusIcon = (status) => {
    if (status === 'connected' || status.includes('connected')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (status === 'failed') {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
  }

  const getStatusColor = (status) => {
    if (status === 'connected' || status.includes('connected')) {
      return 'text-green-600'
    } else if (status === 'failed') {
      return 'text-red-600'
    }
    return 'text-blue-600'
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Connection Status</h3>
        <button
          onClick={testConnection}
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Backend API:</span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${getStatusColor(connectionStatus.backend)}`}>
              {connectionStatus.backend}
            </span>
            {getStatusIcon(connectionStatus.backend)}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Damage Reports:</span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${getStatusColor(connectionStatus.damages)}`}>
              {connectionStatus.damages}
            </span>
            {getStatusIcon(connectionStatus.damages)}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Statistics:</span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${getStatusColor(connectionStatus.stats)}`}>
              {connectionStatus.stats}
            </span>
            {getStatusIcon(connectionStatus.stats)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2">Backend URL:</div>
        <input
          type="text"
          value={backendUrl}
          onChange={(e) => setBackendUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        />
        <div className="text-xs text-gray-500 mt-1">
          Default: http://localhost:5000 - Change if backend runs on different port
        </div>
      </div>
    </div>
  )
}

export default TestConnection