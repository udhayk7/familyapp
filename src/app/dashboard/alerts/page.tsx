'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Heart, 
  Pill,
  CheckCircle,
  X,
  Filter
} from 'lucide-react'
import { formatRelativeTime, getSeverityColor } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Alert {
  id: string
  type: 'missed_medication' | 'low_stock' | 'symptom_report' | 'emergency'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'emergency'
  senior_name: string
  senior_id: string
  created_at: string
  is_read: boolean
  is_resolved: boolean
  metadata?: {
    medication_name?: string
    stock_count?: number
    symptoms?: string[]
  }
}

export default function AlertsPage() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'emergency'>('all')

  useEffect(() => {
    if (user) {
      fetchAlerts()
    }
  }, [user])

  const fetchAlerts = async () => {
    try {
      // Mock data for demo
      const mockAlerts: Alert[] = [
        {
          id: '1',
          type: 'missed_medication',
          title: 'Missed Medication',
          message: 'Margaret missed her 2:00 PM Lisinopril dose',
          severity: 'high',
          senior_name: 'Margaret Johnson',
          senior_id: 'senior1',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          is_read: false,
          is_resolved: false,
          metadata: {
            medication_name: 'Lisinopril'
          }
        },
        {
          id: '2',
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: 'Robert\'s Aspirin is running low',
          severity: 'medium',
          senior_name: 'Robert Smith',
          senior_id: 'senior2',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          is_read: false,
          is_resolved: false,
          metadata: {
            medication_name: 'Aspirin',
            stock_count: 3
          }
        },
        {
          id: '3',
          type: 'symptom_report',
          title: 'Symptom Report',
          message: 'Dorothy reported feeling dizzy and nauseous',
          severity: 'emergency',
          senior_name: 'Dorothy Wilson',
          senior_id: 'senior3',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          is_read: true,
          is_resolved: false,
          metadata: {
            symptoms: ['dizziness', 'nausea']
          }
        },
        {
          id: '4',
          type: 'missed_medication',
          title: 'Missed Morning Dose',
          message: 'Margaret missed her 8:00 AM Metformin',
          severity: 'medium',
          senior_name: 'Margaret Johnson',
          senior_id: 'senior1',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          is_read: true,
          is_resolved: true,
          metadata: {
            medication_name: 'Metformin'
          }
        },
        {
          id: '5',
          type: 'low_stock',
          title: 'Medication Refill Needed',
          message: 'Margaret\'s Metformin needs refill (2 pills remaining)',
          severity: 'high',
          senior_name: 'Margaret Johnson',
          senior_id: 'senior1',
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          is_read: true,
          is_resolved: false,
          metadata: {
            medication_name: 'Metformin',
            stock_count: 2
          }
        }
      ]

      setAlerts(mockAlerts)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching alerts:', error)
      toast.error('Failed to load alerts')
      setLoading(false)
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.is_read
      case 'emergency':
        return alert.severity === 'emergency'
      default:
        return true
    }
  })

  const markAsRead = async (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      )
    )
    toast.success('Alert marked as read')
  }

  const markAsResolved = async (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, is_resolved: true, is_read: true } : alert
      )
    )
    toast.success('Alert resolved')
  }

  const getAlertIcon = (type: string, severity: string) => {
    const iconClass = severity === 'emergency' ? 'h-6 w-6' : 'h-5 w-5'
    
    switch (type) {
      case 'missed_medication':
        return <Clock className={`${iconClass} text-red-500`} />
      case 'low_stock':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />
      case 'symptom_report':
        return <Heart className={`${iconClass} text-orange-500`} />
      case 'emergency':
        return <AlertTriangle className={`${iconClass} text-red-600`} />
      default:
        return <Bell className={`${iconClass} text-gray-500`} />
    }
  }

  const getAlertBorder = (severity: string) => {
    switch (severity) {
      case 'emergency':
        return 'border-l-4 border-red-500'
      case 'high':
        return 'border-l-4 border-orange-500'
      case 'medium':
        return 'border-l-4 border-yellow-500'
      default:
        return 'border-l-4 border-blue-500'
    }
  }

  const unreadCount = alerts.filter(alert => !alert.is_read).length
  const emergencyCount = alerts.filter(alert => alert.severity === 'emergency').length

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
            <p className="text-gray-600">Monitor important events and take action when needed</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Alerts</option>
                <option value="unread">Unread Only</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Emergency</p>
                <p className="text-2xl font-bold text-gray-900">{emergencyCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? 'All alerts have been read.' 
                  : filter === 'emergency'
                  ? 'No emergency alerts at this time.'
                  : 'No alerts to display.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-6 ${getAlertBorder(alert.severity)} ${
                    !alert.is_read ? 'bg-blue-50' : 'bg-white'
                  } ${alert.is_resolved ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type, alert.severity)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {alert.title}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          {!alert.is_read && (
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              New
                            </span>
                          )}
                          {alert.is_resolved && (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-2">{alert.message}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Senior: {alert.senior_name}</span>
                          <span>{formatRelativeTime(alert.created_at)}</span>
                        </div>

                        {alert.metadata && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            {alert.metadata.medication_name && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Pill className="h-4 w-4 mr-2" />
                                Medication: {alert.metadata.medication_name}
                                {alert.metadata.stock_count && (
                                  <span className="ml-2">({alert.metadata.stock_count} remaining)</span>
                                )}
                              </div>
                            )}
                            {alert.metadata.symptoms && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Heart className="h-4 w-4 mr-2" />
                                Symptoms: {alert.metadata.symptoms.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {!alert.is_read && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                      {!alert.is_resolved && (
                        <button
                          onClick={() => markAsResolved(alert.id)}
                          className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Mark as resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Contact Info */}
        {emergencyCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Emergency Alerts Detected
                </h3>
                <p className="text-sm text-red-800 mb-4">
                  You have {emergencyCount} emergency alert{emergencyCount > 1 ? 's' : ''} that require immediate attention. 
                  Consider contacting the senior directly or emergency services if needed.
                </p>
                <div className="flex space-x-3">
                  <button className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    Contact Senior
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors">
                    Call Emergency Services
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 