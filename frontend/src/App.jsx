import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import Dashboard from './pages/Dashboard'
import MapView from './pages/MapView'
import Reports from './pages/Reports'
import DamageDetails from './pages/DamageDetails'
import About from './pages/About'
import NotFound from './pages/NotFound'
import { DamageProvider } from './context/DamageContext'
import './App.css'

function App() {
  return (
    <DamageProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/damages/:id" element={<DamageDetails />} />
              <Route path="/about" element={<About />} />
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </div>
      </Router>
    </DamageProvider>
  )
}

export default App