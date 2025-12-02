import React from 'react'
import { motion } from 'framer-motion'
import { useDamage } from '../context/DamageContext'
import StatsCards from '../components/Dashboard/StatsCards'
import SeverityChart from '../components/Dashboard/SeverityChart'
import DamageTypeChart from '../components/Dashboard/DamageTypeChart'
import RecentReports from '../components/Dashboard/RecentReports'
import TestConnection from '../components/TestConnection'
import { AlertTriangle } from 'lucide-react'

const Dashboard = () => {
  const { loading } = useDamage()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
        stiffness: 100
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">Damage Overview</h1>
        </div>
        <p className="text-gray-600">
          Real-time monitoring of disaster damages across Sri Lanka
        </p>
      </motion.div>

      {/* Connection Test - Temporary for debugging */}
      <motion.div variants={itemVariants} className="mb-8">
        <TestConnection />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="mb-8">
        <StatsCards />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div variants={itemVariants}>
          <SeverityChart />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DamageTypeChart />
        </motion.div>
      </div>

      {/* Recent Reports */}
      <motion.div variants={itemVariants}>
        <RecentReports />
      </motion.div>
    </motion.div>
  )
}

export default Dashboard