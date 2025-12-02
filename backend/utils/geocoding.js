import axios from 'axios'
import logger from './logger.js'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(NOMINATIM_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        zoom: 18,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'Damage-Display-System/1.0'
      }
    })

    const address = response.data.address
    const district = getSriLankaDistrict(address)
    
    return {
      formatted: response.data.display_name,
      street: address.road || address.street,
      village: address.village || address.town || address.city,
      city: address.city || address.town,
      district: district,
      state: address.state,
      postcode: address.postcode,
      country: address.country,
      countryCode: address.country_code
    }
  } catch (error) {
    logger.error('Geocoding error:', error)
    return {
      formatted: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
    }
  }
}

const getSriLankaDistrict = (address) => {
  const districtKeywords = [
    'colombo', 'gampaha', 'kalutara', 'kandy', 'matale', 'nuwara eliya',
    'galle', 'matara', 'hambantota', 'jaffna', 'kilinochchi', 'mannar',
    'vavuniya', 'mullaitivu', 'batticaloa', 'ampara', 'trincomalee',
    'kurunegala', 'puttalam', 'anuradhapura', 'polonnaruwa', 'badulla',
    'moneragala', 'ratnapura', 'kegalle'
  ]

  const foundDistrict = districtKeywords.find(district => {
    const addressValues = Object.values(address).map(val => 
      val.toString().toLowerCase()
    )
    return addressValues.some(val => val.includes(district))
  })

  return foundDistrict ? formatDistrictName(foundDistrict) : null
}

const formatDistrictName = (district) => {
  return district
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const batchGeocode = async (locations) => {
  const results = []
  
  for (const location of locations) {
    try {
      const geocoded = await reverseGeocode(location.latitude, location.longitude)
      results.push({
        ...location,
        address: geocoded
      })
      
      // Delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      logger.error(`Batch geocoding error for ${location.latitude}, ${location.longitude}:`, error)
      results.push({
        ...location,
        address: null
      })
    }
  }
  
  return results
}