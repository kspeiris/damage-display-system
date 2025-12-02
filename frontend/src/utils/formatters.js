import { format, formatDistanceToNow } from 'date-fns'

export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date'
  const date = new Date(dateString)
  return format(date, 'MMM dd, yyyy')
}

export const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown date'
  const date = new Date(dateString)
  return format(date, 'MMM dd, yyyy HH:mm')
}

export const timeAgo = (dateString) => {
  if (!dateString) return 'Unknown time'
  const date = new Date(dateString)
  return formatDistanceToNow(date, { addSuffix: true })
}

export const formatAddress = (location) => {
  if (!location) return 'Location not specified'
  return location.address || `Lat: ${location.latitude?.toFixed(4)}, Lng: ${location.longitude?.toFixed(4)}`
}

export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const formatNumber = (number) => {
  return new Intl.NumberFormat().format(number)
}