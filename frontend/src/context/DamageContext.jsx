import React, { createContext, useContext, useReducer, useEffect } from 'react'
import damageService from '../services/damageService'  // ✅ DEFAULT IMPORT

const DamageContext = createContext()

const initialState = {
  damages: [],
  filters: {
    severity: 'all',
    propertyType: 'all',
    dateRange: 'all'
  },
  loading: false,
  stats: {
    total: 0,
    bySeverity: {},
    byType: {},
    last24h: 0
  },
  mapView: {
    center: [7.8731, 80.7718], // Sri Lanka center
    zoom: 8
  }
}

function damageReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_DAMAGES':
      return { ...state, damages: action.payload }
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } }
    case 'SET_STATS':
      return { ...state, stats: action.payload }
    case 'ADD_DAMAGE':
      return { ...state, damages: [action.payload, ...state.damages] }
    default:
      return state
  }
}

export function DamageProvider({ children }) {
  const [state, dispatch] = useReducer(damageReducer, initialState)

  useEffect(() => {
    loadDamages()
    loadStats()
  }, [])

  const loadDamages = async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await damageService.getDamages(filters)
      
      // ✅ FIX: Handle different response formats safely
      let damages = []
      
      if (response && Array.isArray(response.damages)) {
        damages = response.damages
      } else if (response && Array.isArray(response)) {
        damages = response
      } else if (response && response.data && Array.isArray(response.data.damages)) {
        damages = response.data.damages
      } else if (response && response.data && Array.isArray(response.data)) {
        damages = response.data
      }
      
      // ✅ FIX: Filter out any null/undefined items and ensure each has required fields
      damages = damages
        .filter(damage => damage != null)
        .map(damage => ({
          ...damage,
          description: damage.description || 'No description',
          propertyType: damage.propertyType || 'unknown',
          severity: damage.severity || 'unknown',
          location: damage.location || { address: '' }
        }))
      
      console.log('✅ Loaded damages:', damages.length, 'items')
      console.log('✅ Sample damage:', damages[0])
      
      dispatch({ type: 'SET_DAMAGES', payload: damages })
    } catch (error) {
      console.error('❌ Error loading damages:', error)
      dispatch({ type: 'SET_DAMAGES', payload: [] })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loadStats = async () => {
    try {
      const stats = await damageService.getStats()
      // Handle response format
      const statsData = stats.data || stats
      dispatch({ type: 'SET_STATS', payload: statsData })
    } catch (error) {
      console.error('❌ Error loading stats:', error)
      dispatch({ type: 'SET_STATS', payload: initialState.stats })
    }
  }

  const addDamage = (damage) => {
    // ✅ FIX: Ensure damage has required fields before adding
    const safeDamage = {
      ...damage,
      description: damage.description || 'No description',
      propertyType: damage.propertyType || 'unknown',
      severity: damage.severity || 'unknown',
      location: damage.location || { address: '' }
    }
    
    dispatch({ type: 'ADD_DAMAGE', payload: safeDamage })
  }

  const updateFilters = (newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters })
    loadDamages({ ...state.filters, ...newFilters })
  }

  // Add new damage to backend
  const createDamage = async (damageData) => {
    try {
      const newDamage = await damageService.reportDamage(damageData)
      const damageToAdd = newDamage.damage || newDamage
      addDamage(damageToAdd)
      return { success: true, damage: damageToAdd }
    } catch (error) {
      console.error('❌ Error creating damage:', error)
      return { success: false, error: error.message }
    }
  }

  // Clean up data for testing
  const cleanup = async () => {
    try {
      await damageService.cleanup()
      dispatch({ type: 'SET_DAMAGES', payload: [] })
      return { success: true }
    } catch (error) {
      console.error('❌ Error cleaning up:', error)
      return { success: false, error: error.message }
    }
  }

  // Seed test data
  const seedTestData = async () => {
    try {
      await damageService.seedData()
      await loadDamages()
      return { success: true }
    } catch (error) {
      console.error('❌ Error seeding data:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    ...state,
    loadDamages,
    loadStats,
    addDamage,
    createDamage,
    updateFilters,
    cleanup,
    seedTestData
  }

  return (
    <DamageContext.Provider value={value}>
      {children}
    </DamageContext.Provider>
  )
}

export const useDamage = () => {
  const context = useContext(DamageContext)
  if (!context) {
    throw new Error('useDamage must be used within a DamageProvider')
  }
  return context
}

// ✅ REMOVE THIS LINE - It shouldn't be here!
// export default damageService