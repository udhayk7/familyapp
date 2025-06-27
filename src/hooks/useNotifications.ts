import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export interface Notification {
  id: string
  user_id: string
  senior_profile_id: string
  notification_type: 'medication_reminder' | 'symptom_alert' | 'emergency' | 'low_stock' | 'appointment'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'emergency'
  is_read: boolean
  is_actionable: boolean
  action_url?: string
  metadata?: {
    medication_id?: string
    symptom_report_id?: string
    alert_id?: string
  }
  created_at: string
  read_at?: string
}

export interface NotificationStats {
  total: number
  unread: number
  emergency: number
  today: number
}

export const useNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    emergency: 0,
    today: 0
  })

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Mock data for demo - replace with real Supabase query
      const mockNotifications: Notification[] = [
        {
          id: '1',
          user_id: user.id,
          senior_profile_id: 'senior1',
          notification_type: 'medication_reminder',
          title: 'Medication Reminder',
          message: 'Margaret missed her 2:00 PM Lisinopril dose',
          severity: 'high',
          is_read: false,
          is_actionable: true,
          action_url: '/dashboard/medications',
          metadata: { medication_id: 'med1' },
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          user_id: user.id,
          senior_profile_id: 'senior2',
          notification_type: 'symptom_alert',
          title: 'Symptom Alert',
          message: 'Dorothy reported feeling dizzy and nauseous',
          severity: 'emergency',
          is_read: false,
          is_actionable: true,
          action_url: '/dashboard/alerts',
          metadata: { symptom_report_id: 'symptom1' },
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          user_id: user.id,
          senior_profile_id: 'senior1',
          notification_type: 'low_stock',
          title: 'Low Stock Alert',
          message: 'Margaret\'s Metformin is running low (2 pills remaining)',
          severity: 'medium',
          is_read: true,
          is_actionable: true,
          action_url: '/dashboard/medications',
          metadata: { medication_id: 'med2' },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        }
      ]

      setNotifications(mockNotifications)
      updateStats(mockNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Update notification statistics
  const updateStats = (notificationList: Notification[]) => {
    const today = new Date().toDateString()
    const stats = {
      total: notificationList.length,
      unread: notificationList.filter(n => !n.is_read).length,
      emergency: notificationList.filter(n => n.severity === 'emergency' && !n.is_read).length,
      today: notificationList.filter(n => new Date(n.created_at).toDateString() === today).length
    }
    setStats(stats)
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      )
      
      // Update stats
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )
      updateStats(updatedNotifications)
      
      // TODO: Update in database
      // await supabase
      //   .from('notifications')
      //   .update({ is_read: true, read_at: new Date().toISOString() })
      //   .eq('id', notificationId)
      
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to update notification')
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: notification.read_at || new Date().toISOString()
        }))
      )
      
      updateStats(notifications.map(n => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read')
      
      // TODO: Update in database
      // await supabase
      //   .from('notifications')
      //   .update({ is_read: true, read_at: new Date().toISOString() })
      //   .eq('user_id', user.id)
      //   .eq('is_read', false)
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to update notifications')
    }
  }

  // Create a new notification
  const createNotification = async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'is_read'>) => {
    if (!user) return

    try {
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}`,
        user_id: user.id,
        is_read: false,
        created_at: new Date().toISOString()
      }

      setNotifications(prev => [newNotification, ...prev])
      updateStats([newNotification, ...notifications])

      // Show toast notification
      const toastMessage = `${notification.title}: ${notification.message}`
      
      switch (notification.severity) {
        case 'emergency':
          toast.error(toastMessage, { duration: 10000 })
          break
        case 'high':
          toast.error(toastMessage, { duration: 6000 })
          break
        case 'medium':
          toast(toastMessage, { duration: 4000 })
          break
        default:
          toast.success(toastMessage, { duration: 3000 })
      }

      // TODO: Save to database
      // await supabase
      //   .from('notifications')
      //   .insert(newNotification)

    } catch (error) {
      console.error('Error creating notification:', error)
      toast.error('Failed to create notification')
    }
  }

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return

    fetchNotifications()

    // TODO: Set up real-time subscription
    // const subscription = supabase
    //   .channel('notifications')
    //   .on('postgres_changes', 
    //     { 
    //       event: 'INSERT', 
    //       schema: 'public', 
    //       table: 'notifications',
    //       filter: `user_id=eq.${user.id}`
    //     }, 
    //     (payload) => {
    //       const newNotification = payload.new as Notification
    //       setNotifications(prev => [newNotification, ...prev])
    //       updateStats([newNotification, ...notifications])
    //       
    //       // Show real-time toast
    //       toast.success(`New: ${newNotification.title}`)
    //     }
    //   )
    //   .subscribe()

    // return () => {
    //   subscription.unsubscribe()
    // }
  }, [user, fetchNotifications])

  // Request push notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'denied') {
      toast.error('Notifications are blocked. Please enable them in browser settings.')
      return false
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast.success('Notifications enabled!')
        return true
      } else {
        toast.error('Notification permission denied')
        return false
      }
    }

    return Notification.permission === 'granted'
  }

  // Send push notification
  const sendPushNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'medication-reminder',
        requireInteraction: true
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close()
      }, 10000)
    }
  }

  return {
    notifications,
    loading,
    stats,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    requestNotificationPermission,
    sendPushNotification
  }
} 