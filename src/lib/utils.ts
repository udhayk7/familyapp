import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate 6-digit linking code
export function generateLinkCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Format time for display
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour24 = parseInt(hours)
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
  const ampm = hour24 >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes} ${ampm}`
}

// Format date for display
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format relative time
export function formatRelativeTime(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

// Check if medication is low stock
export function isLowStock(quantity: number, threshold: number): boolean {
  return quantity <= threshold
}

// Get severity color for symptoms
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'low':
      return 'text-green-600 bg-green-100'
    case 'medium':
      return 'text-yellow-600 bg-yellow-100'
    case 'high':
      return 'text-orange-600 bg-orange-100'
    case 'emergency':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

// Get status color for medication logs
export function getStatusColor(status: string): string {
  switch (status) {
    case 'taken':
      return 'text-green-600 bg-green-100'
    case 'missed':
      return 'text-red-600 bg-red-100'
    case 'skipped':
      return 'text-yellow-600 bg-yellow-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

// Parse schedule times from database
export function parseScheduleTimes(times: string[]): string[] {
  return times.map(time => formatTime(time))
}

// Convert 12-hour format to 24-hour format
export function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(' ')
  let [hours, minutes] = time.split(':')
  
  if (hours === '12') {
    hours = '00'
  }
  
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString()
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`
} 