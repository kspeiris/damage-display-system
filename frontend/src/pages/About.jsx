import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Users, 
  MapPin, 
  AlertTriangle, 
  Phone, 
  Mail, 
  Home, 
  Building, 
  Wrench, 
  Trees,
  BookOpen,
  Target,
  AlertCircle,
  Heart,
  Clock,
  PhoneCall,
  Globe,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  HelpCircle
} from 'lucide-react'

const About = () => {
  const [openAccordion, setOpenAccordion] = useState(null)

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
    { name: 'Disaster Management Centre', number: '117', type: 'General Emergency', color: 'bg-red-500' },
    { name: 'Police Emergency', number: '119', type: 'Police', color: 'bg-blue-500' },
    { name: 'Ambulance Service', number: '110', type: 'Medical', color: 'bg-green-500' },
    { name: 'Fire & Rescue', number: '111', type: 'Fire', color: 'bg-orange-500' },
    { name: 'National Disaster Relief Services', number: '011-2671315', type: 'Disaster Relief', color: 'bg-purple-500' },
    { name: 'Sri Lanka Red Cross', number: '011-2691095', type: 'Humanitarian Aid', color: 'bg-red-600' },
    { name: 'CEB Emergency', number: '1987', type: 'Electricity', color: 'bg-yellow-500' },
    { name: 'Water Supply Board', number: '011-2393194', type: 'Water Supply', color: 'bg-blue-600' }
  ]

  const howToReportSteps = [
    {
      step: 1,
      title: 'Click "Report Damage"',
      description: 'Start by clicking the "Report Damage" button from any page',
      icon: Target
    },
    {
      step: 2,
      title: 'Select Location',
      description: 'Either allow location access or click on the map to pinpoint the exact location',
      icon: MapPin
    },
    {
      step: 3,
      title: 'Add Details',
      description: 'Fill in damage severity, property type, and description',
      icon: FileText
    },
    {
      step: 4,
      title: 'Upload Photos',
      description: 'Add clear photos of the damage (optional but recommended)',
      icon: AlertCircle
    },
    {
      step: 5,
      title: 'Submit Report',
      description: 'Review and submit. Your report will appear on the map immediately',
      icon: Shield
    }
  ]

  const emergencyInstructions = [
    {
      title: 'During a Flood',
      instructions: [
        'Move to higher ground immediately',
        'Avoid walking or driving through flood waters',
        'Turn off electricity at the main breaker',
        'Listen to local news and weather updates',
        'Evacuate if instructed by authorities'
      ]
    },
    {
      title: 'During a Landslide',
      instructions: [
        'Stay alert and awake during heavy rainfall',
        'Listen for unusual sounds like trees cracking',
        'Move away from the path of debris',
        'Evacuate immediately if in a landslide-prone area',
        'Help neighbors who may need assistance'
      ]
    },
    {
      title: 'During Strong Winds',
      instructions: [
        'Take shelter in a sturdy building',
        'Stay away from windows and glass doors',
        'Secure loose objects outside',
        'Do not use electrical appliances during thunderstorms',
        'Monitor weather updates regularly'
      ]
    },
    {
      title: 'General Preparedness',
      instructions: [
        'Keep emergency kit ready (food, water, medicine)',
        'Have important documents in waterproof bags',
        'Know your evacuation routes',
        'Keep emergency contacts handy',
        'Stay informed about weather warnings'
      ]
    }
  ]

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-6">
            <Shield className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Damage Display System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive platform designed to provide real-time damage assessment and 
            visualization during natural disasters in Sri Lanka.
          </p>
        </motion.div>

        {/* Emergency Instructions Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex items-center mb-8">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Emergency Instructions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {emergencyInstructions.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div 
                  className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200 cursor-pointer"
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    </div>
                    {openAccordion === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
                
                <AnimatePresence>
                  {openAccordion === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4"
                    >
                      <ul className="space-y-2">
                        {item.instructions.map((instruction, i) => (
                          <li key={i} className="flex items-start text-gray-600">
                            <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <span className="text-xs font-semibold text-primary-600">{i + 1}</span>
                            </div>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8 mb-16 border border-primary-100"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Target className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="text-lg leading-relaxed">
                The Damage Display System aims to revolutionize disaster response in Sri Lanka by 
                providing immediate, accurate, and visual damage assessment data. Our platform 
                empowers communities, emergency responders, and government agencies with the 
                information needed to make critical decisions during natural disasters.
              </p>
              <p className="text-lg leading-relaxed">
                By leveraging modern web technologies and community participation, we create a 
                collaborative ecosystem that enhances disaster preparedness and response efficiency.
              </p>
              <div className="pt-4 mt-6 border-t border-primary-100">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm font-medium">Save Lives</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">Real-time Response</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium">Community Powered</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-sm font-medium">Nationwide Coverage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How to Report Damage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center mb-8">
            <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">How to Report Damage</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {howToReportSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full hover:shadow-md transition-shadow">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-center">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm text-center">
                      {step.description}
                    </p>
                  </div>
                  
                  {index < howToReportSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-0.5 bg-gray-300"></div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 max-w-2xl mx-auto">
              <strong>Note:</strong> All reports are reviewed by our team and emergency services for accuracy. 
              Please provide as much detail as possible to help responders.
            </p>
          </div>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="flex items-center mb-8">
            <PhoneCall className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {emergencyContacts.map((contact, index) => (
              <motion.div
                key={contact.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="group"
              >
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 h-full hover:shadow-md transition-all group-hover:-translate-y-1">
                  <div className={`w-12 h-12 ${contact.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-center text-sm">
                    {contact.name}
                  </h3>
                  <a 
                    href={`tel:${contact.number.replace(/\D/g, '')}`}
                    className="block text-xl font-bold text-center mb-1 hover:text-primary-600 transition-colors"
                  >
                    {contact.number}
                  </a>
                  <p className="text-xs text-gray-500 text-center">{contact.type}</p>
                  <div className="mt-3 flex justify-center">
                    <a 
                      href={`tel:${contact.number.replace(/\D/g, '')}`}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors flex items-center"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call Now
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Important Contacts */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Important Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Government Services</h4>
                <ul className="space-y-1">
                  <li>• District Secretariats</li>
                  <li>• Divisional Secretariats</li>
                  <li>• Grama Niladhari Offices</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">NGOs & Aid Organizations</h4>
                <ul className="space-y-1">
                  <li>• World Vision Lanka</li>
                  <li>• Save the Children</li>
                  <li>• Sarvodaya</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Important Websites</h4>
                <ul className="space-y-1">
                  <li>• disastermin.gov.lk</li>
                  <li>• meteo.gov.lk</li>
                  <li>• dms.gov.lk</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center mb-8">
            <HelpCircle className="h-8 w-8 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Key Features</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-7 w-7 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary-500 to-blue-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Need Help or Have Questions?</h2>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Our team is here to support you. Contact us for technical assistance, 
              report verification, or general inquiries about the platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@damagedisplay.gov.lk"
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </a>
              <a 
                href="tel:0112345678"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default About