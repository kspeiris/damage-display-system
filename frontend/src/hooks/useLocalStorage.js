import { useState, useEffect } from 'react'

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

export const useRecentSearches = (key = 'recentSearches', maxItems = 5) => {
  const [searches, setSearches] = useLocalStorage(key, [])

  const addSearch = (searchTerm) => {
    if (!searchTerm.trim()) return
    
    setSearches(prev => {
      const filtered = prev.filter(item => item !== searchTerm)
      const updated = [searchTerm, ...filtered].slice(0, maxItems)
      return updated
    })
  }

  const clearSearches = () => {
    setSearches([])
  }

  return {
    searches,
    addSearch,
    clearSearches
  }
}