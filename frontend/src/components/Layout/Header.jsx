import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Map, AlertTriangle, Menu, X, Home, Info, PlusCircle } from 'lucide-react'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Map View', href: '/map', icon: Map },
    { name: 'Damage Reports', href: '/reports', icon: AlertTriangle },
    { name: 'About', href: '/about', icon: Info },
  ]

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path))
  }

  return (
    <header className="bg-blue-800 text-white shadow-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <span className="ml-2 text-xl font-bold">
                Damage Display System
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700/50'
                  }`}
                >
                  <Icon className="inline h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
            
            {/* Report Button */}
            <button className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center transition-colors">
              <PlusCircle className="h-5 w-5 mr-2" />
              Report Damage
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-blue-700">
            <div className="pt-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-3 rounded-lg ${
                      isActive(item.href)
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-200 hover:bg-blue-700/50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
              <button className="w-full mt-4 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center">
                <PlusCircle className="h-5 w-5 mr-2" />
                Report Damage
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header