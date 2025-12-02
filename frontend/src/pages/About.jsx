import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, MapPin, AlertTriangle, Phone, Mail, Home, Building, Wrench, Trees } from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Real-time Mapping',
      description: 'Interactive maps showing damage locations with severity-based color coding for quick assessment.'
    },
    {
      icon: AlertTriangle,
      title: 'Damage Reporting',
      description: 'Easy-to-use reporting system with photo uploads and automatic location detection.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Collaborative platform where citizens and organizations can share critical information.'
    },
    {
      icon: Shield,
      title: 'Verified Information',
      description: 'Validation system to ensure accurate and reliable damage reports.'
    }
  ]

  const emergencyContacts = [
    { name: 'Disaster Management Centre', number: '117', type: 'General Emergency' },
    { name: 'Police Emergency', number: '119', type: 'Police' },
    { name: 'Ambulance Service', number: '110', type: 'Medical' },
    { name: 'Fire & Rescue', number: '111', type: 'Fire' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Damage Display System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive platform designed to provide real-time damage assessment and 
            visualization during natural disasters in Sri Lanka.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-16"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              The Damage Display System aims to revolutionize disaster response in Sri Lanka by 
              providing immediate, accurate, and visual damage assessment data. Our platform 
              empowers communities, emergency responders, and government agencies with the 
              information needed to make critical decisions during natural disasters.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              By leveraging modern web technologies and community participation, we create a 
              collaborative ecosystem that enhances disaster preparedness and response efficiency.
            </p>
          </div>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-red-50 rounded-xl border border-red-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Emergency Contacts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyContacts.map((contact, index) => (
              <motion.div
                key={contact.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-white rounded-lg p-4 text-center shadow-sm border border-red-100"
              >
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{contact.name}</h3>
                <p className="text-2xl font-bold text-red-600 mb-1">{contact.number}</p>
                <p className="text-sm text-gray-600">{contact.type}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-6">
            <p className="text-gray-600">
              <strong>Important:</strong> In case of immediate danger, always call emergency services first.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default About