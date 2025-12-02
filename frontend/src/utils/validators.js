export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

export const validateCoordinates = (lat, lng) => {
  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)
  
  return (
    !isNaN(latNum) && !isNaN(lngNum) &&
    latNum >= -90 && latNum <= 90 &&
    lngNum >= -180 && lngNum <= 180
  )
}

export const validateDamageReport = (data) => {
  const errors = {}

  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters'
  }

  if (!data.severity) {
    errors.severity = 'Severity level is required'
  }

  if (!data.propertyType) {
    errors.propertyType = 'Property type is required'
  }

  if (!data.latitude || !data.longitude) {
    errors.location = 'Location coordinates are required'
  } else if (!validateCoordinates(data.latitude, data.longitude)) {
    errors.location = 'Invalid coordinates provided'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}