// Service for handling localStorage and session storage

export const storageService = {
  // Token Management
  setToken: (token) => {
    localStorage.setItem('authToken', token)
  },

  getToken: () => {
    return localStorage.getItem('authToken')
  },

  removeToken: () => {
    localStorage.removeItem('authToken')
  },

  // User Data
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
  },

  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  removeUser: () => {
    localStorage.removeItem('user')
  },

  // Recent Searches
  setRecentSearches: (searches) => {
    localStorage.setItem('recentSearches', JSON.stringify(searches))
  },

  getRecentSearches: () => {
    const searches = localStorage.getItem('recentSearches')
    return searches ? JSON.parse(searches) : []
  },

  addRecentSearch: (searchTerm) => {
    const searches = storageService.getRecentSearches()
    const filtered = searches.filter(item => item !== searchTerm)
    const updated = [searchTerm, ...filtered].slice(0, 5)
    storageService.setRecentSearches(updated)
  },

  clearRecentSearches: () => {
    localStorage.removeItem('recentSearches')
  },

  // Map Preferences
  setMapPreferences: (preferences) => {
    localStorage.setItem('mapPreferences', JSON.stringify(preferences))
  },

  getMapPreferences: () => {
    const prefs = localStorage.getItem('mapPreferences')
    return prefs ? JSON.parse(prefs) : {
      center: [7.8731, 80.7718],
      zoom: 8,
      layer: 'markers'
    }
  },

  // Clear all storage
  clearAll: () => {
    localStorage.clear()
    sessionStorage.clear()
  }
}