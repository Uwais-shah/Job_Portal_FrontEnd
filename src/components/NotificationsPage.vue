<template>
  <q-card class="notification-card q-pa-xl q-mb-xl" flat bordered>
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center q-gutter-md">
        <q-icon name="notifications" size="44px" color="primary" class="notification-icon" />
        <div class="text-h5 text-primary text-weight-bold header-title">Notifications</div>
        <q-badge
          v-if="notifications.length > 0"
          :label="notifications.length"
          color="red-7"
          rounded
          floating
          class="q-ml-sm text-subtitle2 badge-adjust"
          :aria-label="`${notifications.length} unread notifications`"
        />
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          flat
          round
          icon="refresh"
          size="md"
          @click="refreshNotifications"
          :loading="loading"
          aria-label="Refresh notifications"
          class="refresh-btn"
        >
          <q-tooltip class="professional-tooltip" anchor="top middle" self="bottom middle" :offset="[10, 10]">
            Refresh Notifications
          </q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="delete_sweep"
          size="md"
          @click="clearAllNotifications"
          aria-label="Clear all notifications"
          v-if="notifications.length > 0"
          class="clear-btn"
        >
          <q-tooltip class="professional-tooltip" anchor="top middle" self="bottom middle" :offset="[10, 10]">
            Clear All Notifications
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <q-separator inset class="q-my-lg separator" />

    <!-- Loading State -->
    <div v-if="loading && notifications.length === 0" class="text-center q-py-xl">
      <q-spinner color="primary" size="3em" />
      <div class="text-body2 text-grey-6 q-mt-md">Loading notifications...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state text-center q-py-xl">
      <q-icon name="error_outline" size="80px" color="red-5" class="q-mb-lg" />
      <div class="text-h6 text-red-8 text-weight-medium">Failed to Load Notifications</div>
      <div class="text-body2 text-grey-6 q-mb-lg">{{ errorMessage }}</div>
      <q-btn 
        color="primary" 
        @click="refreshNotifications" 
        :loading="loading"
        label="Try Again"
        class="q-mt-md"
      />
    </div>

    <!-- Notifications List -->
    <div v-else-if="notifications.length > 0" class="q-mt-xl">
      <!-- Filter/Sort Controls -->
      <div class="row items-center justify-between q-mb-md">
        <q-select
          v-model="filterType"
          :options="filterOptions"
          label="Filter by type"
          dense
          outlined
          class="filter-select"
          style="min-width: 150px"
          emit-value
          map-options
        />
        <q-btn-group flat>
          <q-btn
            flat
            :color="sortOrder === 'newest' ? 'primary' : 'grey'"
            label="Newest"
            @click="sortOrder = 'newest'"
            size="sm"
          />
          <q-btn
            flat
            :color="sortOrder === 'oldest' ? 'primary' : 'grey'"
            label="Oldest"
            @click="sortOrder = 'oldest'"
            size="sm"
          />
        </q-btn-group>
      </div>

      <q-list bordered class="rounded-borders notification-list">
        <transition-group name="slide-fade">
          <q-item
            v-for="notification in filteredAndSortedNotifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'notification-unread': !notification.read }"
            clickable
            @click="markAsRead(notification)"
            :aria-label="`Notification: ${notification.message}`"
          >
            <q-item-section avatar>
              <div class="relative">
                <q-icon
                  :name="getNotificationIcon(notification.type)"
                  :color="getNotificationColor(notification.type)"
                  size="34px"
                  class="notification-type-icon"
                />
                <q-badge
                  v-if="!notification.read"
                  color="red"
                  floating
                  rounded
                  style="top: -5px; right: -5px"
                  aria-label="Unread"
                />
              </div>
            </q-item-section>
            
            <q-item-section>
              <q-item-label class="notification-message text-weight-medium">
                {{ notification.message }}
              </q-item-label>
              <q-item-label caption class="notification-timestamp">
                {{ formatTimestamp(notification.created_at) }}
              </q-item-label>
              <div v-if="notification.action_url" class="q-mt-sm">
                <q-btn
                  flat
                  dense
                  color="primary"
                  :label="notification.action_text || 'View Details'"
                  @click.stop="handleAction(notification)"
                  size="sm"
                />
              </div>
            </q-item-section>
            
            <q-item-section side class="notification-actions">
              <div class="column q-gutter-xs">
                <q-btn
                  v-if="!notification.read"
                  flat
                  round
                  icon="mark_email_read"
                  size="sm"
                  @click.stop="markAsRead(notification)"
                  class="action-btn"
                  aria-label="Mark as read"
                >
                  <q-tooltip class="professional-tooltip">Mark as Read</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  icon="close"
                  size="sm"
                  @click.stop="dismissNotification(notification.id)"
                  class="close-btn"
                  aria-label="Dismiss this notification"
                >
                  <q-tooltip class="professional-tooltip">Dismiss</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </transition-group>
      </q-list>

      <!-- Load More -->
      <div v-if="hasMore" class="text-center q-mt-lg">
        <q-btn
          flat
          color="primary"
          @click="loadMoreNotifications"
          :loading="loadingMore"
          label="Load More"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="no-notifications text-center text-grey-6 q-py-xl">
      <q-icon name="notifications_off" size="80px" color="grey-5" class="q-mb-lg" />
      <div class="text-h6 text-grey-8 text-weight-medium">You're All Caught Up!</div>
      <div class="text-body2 text-grey-6">No new notifications to display.</div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import notificationService from 'src/services/notification.service'
import { formatDistanceToNow } from 'date-fns'

const $q = useQuasar()
const notifications = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref(null)
const currentPage = ref(1)
const hasMore = ref(true)
const userId = ref(21) // TODO: Replace with dynamic user ID from auth service
const filterType = ref('all')
const sortOrder = ref('newest')

// Filter options
const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
]

// Computed property for error message
const errorMessage = computed(() => {
  return error.value ? (typeof error.value === 'string' ? error.value : 'An unexpected error occurred') : ''
})

// Computed property for filtered and sorted notifications
const filteredAndSortedNotifications = computed(() => {
  let filtered = notifications.value
  if (filterType.value !== 'all') {
    filtered = notifications.value.filter(n => n.type === filterType.value)
  }
  return filtered.sort((a, b) => {
    const dateA = new Date(a.created_at)
    const dateB = new Date(b.created_at)
    return sortOrder.value === 'newest' ? dateB - dateA : dateA - dateB
  })
})

// Load notifications
const loadNotifications = async (page = 1, append = false) => {
  try {
    loading.value = !append
    loadingMore.value = append
    const data = await notificationService.fetchNotifications(userId.value, page)

    const formatted = Array.isArray(data)
      ? data.map(n => ({
          id: n.id,
          message: n.message,
          created_at: n.created_at,
          read: n.read,
          type: n.type,
          action_url: n.action_url,
          action_text: n.action_text
        }))
      : []

    if (append) {
      notifications.value.push(...formatted)
    } else {
      notifications.value = formatted
    }

    hasMore.value = data.hasMore || false
    currentPage.value = page
  } catch (err) {
    error.value = err.response?.data?.message || err.message
    $q.notify({ type: 'negative', message: errorMessage.value })
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// Load more notifications
const loadMoreNotifications = async () => {
  if (!hasMore.value || loadingMore.value) return
  await loadNotifications(currentPage.value + 1, true)
}

// Refresh notifications
const refreshNotifications = async () => {
  currentPage.value = 1
  hasMore.value = true
  await loadNotifications(1, false)
}

// Dismiss a notification
const dismissNotification = async (id) => {
  try {
    await notificationService.dismissNotification(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
    $q.notify({ type: 'positive', message: 'Notification dismissed' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Failed to dismiss notification' })
  }
}

// Clear all notifications
const clearAllNotifications = async () => {
  try {
    await notificationService.clearAllNotifications(userId.value)
    notifications.value = []
    $q.notify({ type: 'positive', message: 'All notifications cleared' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Failed to clear notifications' })
  }
}

// Mark notification as read
const markAsRead = async (notification) => {
  if (notification.read) return
  try {
    await notificationService.markAsRead(notification.id)
    notification.read = true
    $q.notify({ type: 'positive', message: 'Notification marked as read' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Failed to mark as read' })
  }
}

// Handle action button click
const handleAction = (notification) => {
  if (notification.action_url) {
    window.open(notification.action_url, '_blank')
  }
}

// Get notification icon based on type
const getNotificationIcon = (type) => {
  const icons = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    success: 'check_circle'
  }
  return icons[type] || 'notifications'
}

// Get notification color based on type
const getNotificationColor = (type) => {
  const colors = {
    info: 'blue-6',
    warning: 'orange-6',
    error: 'red-6',
    success: 'green-6'
  }
  return colors[type] || 'grey-6'
}

// Format timestamp
const formatTimestamp = (timestamp) => {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  } catch {
    return 'Unknown time'
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
/* Existing styles remain unchanged for brevity. Consider the following additions: */

/* Ensure focus states are more prominent */
.notification-item:focus-visible,
.close-btn:focus-visible,
.clear-btn:focus-visible,
.refresh-btn:focus-visible,
.action-btn:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 3px;
  border-radius: 8px;
}

/* Improve transition group layout */
.notification-list .q-item {
  position: relative;
}

/* Optimize for very small screens */
@media (max-width: 360px) {
  .notification-card {
    padding: 16px;
  }
  .notification-message {
    font-size: 14px;
  }
  .notification-timestamp {
    font-size: 11px;
  }
}
</style>