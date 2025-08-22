import api from './auth.service'

// Fetch paginated notifications
const fetchNotifications = async (userId, page = 1) => {
  const response = await api.get(`/notifications/${userId}`, {
    params: { page }
  })
  console.log('Fetched notifications:', response.data)
  return response.data
}

// Dismiss single notification
const dismissNotification = async (id) => {
  return api.delete(`/notifications/${id}`)
}

// Clear all notifications for a user
const clearAllNotifications = async (userId) => {
  return api.delete(`/notifications/user/${userId}`)
}

// Mark notification as read
const markAsRead = async (id) => {
  return api.put(`/notifications/${id}/seen`)
}

export default {
  fetchNotifications,
  dismissNotification,
  clearAllNotifications,
  markAsRead
}
