import React from 'react'
import { 
  AlertTriangle, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  Heart, 
  Globe, 
  Twitter, 
  Facebook,
  ExternalLink,
  AlertCircle,
  Ambulance,
  Shield
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  const emergencyNumbers = [
    { name: 'National Emergency', number: '119', icon: ShieldAlert, color: 'text-red-400' },
    { name: 'Police', number: '118 / 119', icon: Shield, color: 'text-blue-400' },
    { name: 'Ambulance / Fire', number: '110', icon: Ambulance, color: 'text-green-400' },
    { name: 'Disaster Management', number: '117', icon: AlertCircle, color: 'text-orange-400' },
  ]

  const quickLinks = [
    { name: 'Dashboard', href: '/', description: 'Live statistics' },
    { name: 'Map View', href: '/map', description: 'Interactive damage map' },
    { name: 'Report Damage', href: '/reports?new=true', description: 'Submit new report' },
    { name: 'Analytics', href: '/analytics', description: 'Data insights' },
    { name: 'About System', href: '/about', description: 'Learn more' },
  ]

  const govSites = [
    { name: 'DMC Sri Lanka', url: 'https://www.dmc.gov.lk', icon: Globe },
    { name: 'Meteorology Dept', url: 'https://www.meteo.gov.lk', icon: Globe },
    { name: 'NDMC', url: 'https://ndmc.gov.lk', icon: Globe },
    { name: 'ReliefWeb', url: 'https://reliefweb.int', icon: ExternalLink },
  ]

  const socialLinks = [
    { name: 'Twitter', url: 'https://twitter.com', icon: Twitter, color: 'hover:text-blue-400' },
    { name: 'Facebook', url: 'https://facebook.com', icon: Facebook, color: 'hover:text-blue-600' },
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white border-t border-blue-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Emergency Banner */}
        <div className="py-4 border-b border-red-800/30">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="relative">
                <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold">EMERGENCY ALERT SYSTEM ACTIVE</h3>
                <p className="text-sm text-gray-300">24/7 Disaster Response Monitoring</p>
              </div>
            </div>
            <a 
              href="tel:119" 
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center group"
            >
              <Phone className="h-5 w-5 mr-2 animate-pulse" />
              CALL 119 FOR EMERGENCY
            </a>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Brand & Description */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-full blur-md opacity-30"></div>
                  <AlertTriangle className="relative h-10 w-10 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                    Damage Display System
                  </h2>
                  <p className="text-sm text-blue-300">Sri Lanka Disaster Response Platform</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-xl">
                A real-time damage visualization and emergency reporting platform supporting 
                disaster response coordination across Sri Lanka. Empowering communities and 
                responders with critical information during crises.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-gray-800 rounded-lg ${social.color} transition-all hover:bg-gray-700 hover:scale-110`}
                    title={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div>
              <h3 className="text-xl font-bold mb-6 pb-2 border-b border-blue-800/50 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-400" />
                Emergency Contacts
              </h3>
              <ul className="space-y-4">
                {emergencyNumbers.map((contact) => (
                  <li key={contact.name} className="group">
                    <a 
                      href={`tel:${contact.number.replace(' / ', '')}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all duration-200 group-hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${contact.color}`}>
                          <contact.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{contact.name}</div>
                          <div className="text-sm text-gray-400">{contact.number}</div>
                        </div>
                      </div>
                      <Phone className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links & Gov Sites */}
            <div>
              <h3 className="text-xl font-bold mb-6 pb-2 border-b border-blue-800/50">
                Quick Access
              </h3>
              <div className="space-y-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="block p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/70 transition-all duration-200 group"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold group-hover:text-yellow-300 transition-colors">
                          {link.name}
                        </div>
                        <div className="text-sm text-gray-400">{link.description}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Government Sites */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-3 text-blue-300">Government Resources</h4>
                <div className="grid grid-cols-2 gap-2">
                  {govSites.map((site) => (
                    <a
                      key={site.name}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-3 py-2 rounded bg-gray-800/50 hover:bg-gray-800 transition-colors text-sm"
                    >
                      <site.icon className="h-3 w-3" />
                      <span>{site.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © {currentYear} Damage Display System - Sri Lanka Disaster Response Initiative
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Developed for emergency response coordination and public safety
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <a 
                href="/privacy" 
                className="text-gray-400 hover:text-white text-sm transition-colors hover:underline"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                className="text-gray-400 hover:text-white text-sm transition-colors hover:underline"
              >
                Terms of Service
              </a>
              <a 
                href="/accessibility" 
                className="text-gray-400 hover:text-white text-sm transition-colors hover:underline"
              >
                Accessibility
              </a>
              <a 
                href="/sitemap" 
                className="text-gray-400 hover:text-white text-sm transition-colors hover:underline"
              >
                Sitemap
              </a>
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <Mail className="h-3 w-3" />
                <a href="mailto:support@damagedisplay.lk" className="hover:text-white transition-colors">
                  support@damagedisplay.lk
                </a>
              </div>
            </div>
          </div>

          {/* Official Badges */}
          <div className="mt-6 pt-6 border-t border-gray-800/50 flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 bg-green-900/30 border border-green-700/50 rounded-lg text-xs">
              🔒 SSL Secured
            </div>
            <div className="px-4 py-2 bg-blue-900/30 border border-blue-700/50 rounded-lg text-xs">
              🇱🇰 Official Partner - DMC Sri Lanka
            </div>
            <div className="px-4 py-2 bg-red-900/30 border border-red-700/50 rounded-lg text-xs">
              🚨 24/7 Emergency Monitoring
            </div>
            <div className="px-4 py-2 bg-yellow-900/30 border border-yellow-700/50 rounded-lg text-xs">
              📱 Mobile Responsive
            </div>
          </div>
        </div>
      </div>

      {/* Critical Emergency Notice */}
      <div className="bg-gradient-to-r from-red-900/90 to-red-800/90 py-3 px-4 border-t border-red-700">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-medium">
            ⚠️ This is an official disaster response system. In case of immediate danger, 
            call emergency services first. This platform is for reporting and coordination purposes.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer