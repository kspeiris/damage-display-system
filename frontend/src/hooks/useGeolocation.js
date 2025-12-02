import { useState, useEffect } from 'react'

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    const handleSuccess = (position) => {
      const { latitude, longitude } = position.coords
      setLocation({
        latitude,
        longitude,
        accuracy: position.coords.accuracy
      })
      setLoading(false)
      setError(null)
    }

    const handleError = (error) => {
      let errorMessage = 'Unknown error occurred'
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user.'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.'
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.'
          break
        default:
          errorMessage = error.message
      }
      
      setError(errorMessage)
      setLoading(false)
    }

    if (options.autoStart) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options
      )
    }
  }, [options.autoStart])

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      setLoading(true)
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          setLocation(location)
          setLoading(false)
          setError(null)
          resolve(location)
        },
        (error) => {
          handleError(error)
          reject(error)
        },
        options
      )
    })
  }

  return {
    location,
    error,
    loading,
    getCurrentLocation
  }
}