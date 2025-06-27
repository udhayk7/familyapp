'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Check, X, AlertTriangle, Clock, Heart, Pill, ExternalLink } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { formatRelativeTime } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, stats, markAsRead, markAllAsRead } = useNotifications()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string, severity: string) => {
    const sizeClass = severity === 'emergency' ? 'h-5 w-5' : 'h-4 w-4'
    
    switch (type) {
      case 'medication_reminder':
        return <Pill className={`${sizeClass} text-blue-500`} />
      case 'symptom_alert':
        return <Heart className={`${sizeClass} text-red-500`} />
      case 'emergency':
        return <AlertTriangle className={`${sizeClass} text-red-600`} />
      case 'low_stock':
        return <AlertTriangle className={`${sizeClass} text-yellow-500`} />
      default:
        return <Bell className={`${sizeClass} text-gray-500`} />
    }
  }

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'emergency':
        return 'border-l-4 border-red-500 bg-red-50'
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50'
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50'
      default:
        return 'border-l-4 border-blue-500 bg-blue-50'
    }
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    
    if (notification.action_url) {
      router.push(notification.action_url)
    }
    
    setIsOpen(false)
  }

  const displayNotifications = notifications.slice(0, 10) // Show only recent 10

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        
        {/* Unread Badge */}
        {stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {stats.unread > 9 ? '9+' : stats.unread}
          </span>
        )}

        {/* Emergency Pulse */}
        {stats.emergency > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 animate-ping"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {stats.unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>{stats.total} total</span>
              {stats.unread > 0 && (
                <span className="text-red-600 font-medium">{stats.unread} unread</span>
              )}
              {stats.emergency > 0 && (
                <span className="text-red-600 font-bold flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {stats.emergency} urgent
                </span>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {displayNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      !notification.is_read 
                        ? getSeverityBorder(notification.severity) + ' hover:bg-gray-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.notification_type, notification.severity)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            {notification.is_actionable && (
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                            )}
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(notification.created_at)}
                          </span>
                          
                          {notification.severity === 'emergency' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Urgent
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  router.push('/dashboard/notifications')
                  setIsOpen(false)
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 