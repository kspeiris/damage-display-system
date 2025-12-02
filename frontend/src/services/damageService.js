// frontend/src/services/damageService.js
import api from './api'

const damageService = {
  // Get all damage reports
  async getDamages(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key])
        }
      })

      const response = await api.get(`/damages?${params}`)
      return response
    } catch (error) {
      console.error('❌ Error fetching damages:', error)
      // Return fallback data to prevent frontend crash
      return {
        damages: [],
        pagination: {
          current: 1,
          pages: 0,
          total: 0
        }
      }
    }
  },

  // Report damage (SIMPLE JSON VERSION - No file upload)
  async reportDamage(damageData) {
    try {
      console.log('📤 Sending damage report:', damageData)
      
      // Use the api instance with proxy
      const response = await api.post('/damages/json', damageData)
      
      console.log('✅ Server response:', response)
      return response
    } catch (error) {
      console.error('❌ Error reporting damage:', error)
      
      // Provide a user-friendly error message
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to submit damage report'
      
      throw new Error(errorMessage)
    }
  },

  // Alternative method for FormData (file uploads)
  async reportDamageWithFiles(formData) {
    try {
      console.log('📤 Sending damage report with files')
      
      // Use fetch for FormData since axios has issues with FormData
      const response = await fetch('/api/damages', {
        method: 'POST',
        body: formData
        // Don't set Content-Type for FormData
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit damage report')
      }
      
      return result
    } catch (error) {
      console.error('❌ Error reporting damage with files:', error)
      throw error
    }
  },

  // Get damage by ID
  async getDamageById(id) {
    try {
      const response = await api.get(`/damages/${id}`)
      return response
    } catch (error) {
      console.error('❌ Error fetching damage by id:', error)
      return null
    }
  },

  // Get statistics
  async getStats() {
    try {
      const response = await api.get('/stats')
      return response
    } catch (error) {
      console.error('❌ Error fetching stats:', error)
      // Return fallback stats
      return {
        total: 0,
        bySeverity: {},
        byType: {},
        last24h: 0
      }
    }
  },

  // Update damage report
  async updateDamage(id, damageData) {
    try {
      const response = await api.put(`/damages/${id}`, damageData)
      return response
    } catch (error) {
      console.error('❌ Error updating damage:', error)
      throw error
    }
  },

  // Delete damage report
  async deleteDamage(id) {
    try {
      const response = await api.delete(`/damages/${id}`)
      return response
    } catch (error) {
      console.error('❌ Error deleting damage:', error)
      throw error
    }
  },

  // Verify damage report
  async verifyDamage(id) {
    try {
      const response = await api.patch(`/damages/${id}/verify`)
      return response
    } catch (error) {
      console.error('❌ Error verifying damage:', error)
      throw error
    }
  },

  // Cleanup (for testing)
  async cleanup() {
    try {
      const response = await api.delete('/cleanup')
      return response
    } catch (error) {
      console.error('❌ Error cleaning up:', error)
      throw error
    }
  },

  // Seed test data
  async seedData() {
    try {
      const response = await api.post('/seed')
      return response
    } catch (error) {
      console.error('❌ Error seeding data:', error)
      throw error
    }
  },

  // Test connection to backend
  async testConnection() {
    try {
      const response = await api.get('/health')
      return {
        connected: true,
        data: response
      }
    } catch (error) {
      return {
        connected: false,
        error: error.message
      }
    }
  }
}

export default damageService