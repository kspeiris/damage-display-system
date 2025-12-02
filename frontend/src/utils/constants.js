// Severity levels with color codes
export const SEVERITY_LEVELS = {
  minor: {
    label: 'Minor',
    color: '#10b981',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  },
  moderate: {
    label: 'Moderate', 
    color: '#f59e0b',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  severe: {
    label: 'Severe',
    color: '#f97316',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200'
  },
  destroyed: {
    label: 'Destroyed',
    color: '#ef4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  }
}

// Property types
export const PROPERTY_TYPES = {
  residential: 'Residential',
  commercial: 'Commercial',
  infrastructure: 'Infrastructure',
  agricultural: 'Agricultural'
}

// Sri Lanka districts
export const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
  'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
  'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Moneragala',
  'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
  'Trincomalee', 'Vavuniya'
]

// Map constants
export const MAP_CONSTANTS = {
  defaultCenter: [7.8731, 80.7718], // Sri Lanka center
  defaultZoom: 8,
  minZoom: 7,
  maxZoom: 18
}

// API endpoints
export const API_ENDPOINTS = {
  DAMAGES: '/damages',
  STATS: '/stats',
  UPLOAD: '/upload'
}