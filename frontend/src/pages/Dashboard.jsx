import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDamage } from '../context/DamageContext'
import StatsCards from '../components/Dashboard/StatsCards'
import SeverityChart from '../components/Dashboard/SeverityChart'
import DamageTypeChart from '../components/Dashboard/DamageTypeChart'
import RecentReports from '../components/Dashboard/RecentReports'
import { 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  Shield, 
  TrendingUp,
  MapPin,
  Clock,
  Bell,
  Download,
  Filter,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

const Dashboard = () => {
  const { loading, stats, refreshData } = useDamage()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showSummary, setShowSummary] = useState(true)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    exit: {
      y: -10,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  // Format last updated time
  const formatLastUpdated = () => {
    const now = new Date()
    const diffInMinutes = Math.floor((now - lastUpdated) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    
    return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading && !isRefreshing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading dashboard data...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8"
    >
      {/* Top Summary Bar */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Damage Monitoring</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Tracking {stats?.total || 0} incidents across {stats?.areasAffected || 1} locations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Last updated</div>
                  <div className="font-medium text-gray-900">{formatLastUpdated()}</div>
                </div>
                <button
                  onClick={() => setShowSummary(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Damage Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Real-time monitoring of disaster damages and emergency responses
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">Live Data</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">Secure Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">24/7 Updates</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 font-medium"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="mb-8">
        <StatsCards />
      </motion.div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column */}
        <motion.div 
          variants={itemVariants}
          className="space-y-6"
        >
          <SeverityChart />
          
          {/* Additional Insights */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Response Insights</h3>
              <Bell className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Avg Response Time</div>
                    <div className="text-sm text-gray-600">Emergency teams</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-blue-600">2.4 hrs</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Verified Reports</div>
                    <div className="text-sm text-gray-600">Accuracy rate</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">87%</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-amber-600" />
                  <div>
                    <div className="font-medium text-gray-900">Active Areas</div>
                    <div className="text-sm text-gray-600">Current incidents</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-amber-600">5 zones</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column */}
        <motion.div 
          variants={itemVariants}
          className="space-y-6"
        >
          <DamageTypeChart />
          
          {/* Recent Activity */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View All
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {item === 1 && 'New damage reported in Colombo'}
                      {item === 2 && 'Emergency team dispatched'}
                      {item === 3 && 'Damage verification completed'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item === 1 && '2 minutes ago'}
                      {item === 2 && '15 minutes ago'}
                      {item === 3 && '1 hour ago'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Recent Reports Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Damage Reports</h2>
            <p className="text-gray-600 mt-1">Latest incidents requiring attention and response</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
          </div>
        </div>
        <RecentReports />
      </motion.div>

      {/* Footer Status Bar */}
      <motion.div
        variants={itemVariants}
        className="mt-8 pt-6 border-t border-gray-200"
      >
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>System Status: Operational</span>
            </div>
            <span>•</span>
            <span>Data Updates: Every 5 minutes</span>
            <span>•</span>
            <span>API Status: Connected</span>
          </div>
          <div>
            <span className="text-gray-400">Dashboard v1.0 • </span>
            <span>Last refresh: {formatLastUpdated()}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Dashboard