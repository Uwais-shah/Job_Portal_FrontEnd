<template>
  <div class="job-seeker-page">
    <!-- Static App Header -->
    <div class="static-header">
      <AppHeader />
    </div>

    <!-- Scrollable Body -->
    <div class="scrollable-body">
      <!-- Job Seeker Welcome Header (scrolls with page) -->
      <JobSeekerHeader
        :userName="userName"
        @open-profile="showProfileModal = true"
        @go-resume="goToResume"
      />

      <!-- Navigation Cards -->
      <div class="stats-section q-px-md q-py-md">
        <div class="row q-gutter-sm justify-between">
          <div class="col-2 stats-col">
            <q-card 
              class="stats-card" 
              flat 
              bordered 
              clickable
              v-ripple
              :aria-label="`Navigate to My Applications${applications.length ? `, ${applications.length} new` : ''}`"
              @click="navigate('applications')"
              :class="{ 'active-card': selectedSection === 'applications' }"
            >
              <q-card-section class="stats-content">
                <div class="stats-icon">
                  <q-icon name="assignment_turned_in" :color="selectedSection === 'applications' ? 'white' : 'blue-8'" size="22px" />
                </div>
                <div class="stats-info">
                  <div class="stats-label">Applications</div>
                  <q-badge 
                    v-if="applications.length"
                    :label="applications.length"
                    color="blue-8"
                    rounded
                    class="stats-badge"
                    :aria-label="`${applications.length} new applications`"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-2 stats-col">
            <q-card 
              class="stats-card" 
              flat 
              bordered 
              clickable
              v-ripple
              :aria-label="`Navigate to Bookmarked Jobs`"
              @click="navigate('bookmarks')"
              :class="{ 'active-card': selectedSection === 'bookmarks' }"
            >
              <q-card-section class="stats-content">
                <div class="stats-icon">
                  <q-icon name="bookmark_added" :color="selectedSection === 'bookmarks' ? 'white' : 'indigo-8'" size="22px" />
                </div>
                <div class="stats-info">
                  <div class="stats-label">Bookmarks</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-2 stats-col">
            <q-card 
              class="stats-card" 
              flat 
              bordered 
              clickable
              v-ripple
              :aria-label="`Navigate to Profile`"
              @click="navigate('profile')"
              :class="{ 'active-card': selectedSection === 'profile' }"
            >
              <q-card-section class="stats-content">
                <div class="stats-icon">
                  <q-icon name="account_circle" :color="selectedSection === 'profile' ? 'white' : 'purple-8'" size="22px" />
                </div>
                <div class="stats-info">
                  <div class="stats-label">Profile</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-2 stats-col">
            <q-card 
              class="stats-card" 
              flat 
              bordered 
              clickable
              v-ripple
              :aria-label="`Navigate to Notifications${notifications.length ? `, ${notifications.length} new` : ''}`"
              @click="navigate('notifications')"
              :class="{ 'active-card': selectedSection === 'notifications' }"
            >
              <q-card-section class="stats-content">
                <div class="stats-icon">
                  <q-icon name="notifications_active" :color="selectedSection === 'notifications' ? 'white' : 'orange-8'" size="22px" />
                </div>
                <div class="stats-info">
                  <div class="stats-label">Notifications</div>
                  <q-badge 
                    v-if="notifications.length"
                    :label="notifications.length"
                    color="orange-8"
                    rounded
                    class="stats-badge"
                    :aria-label="`${notifications.length} new notifications`"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-2 stats-col">
            <q-card 
              class="stats-card" 
              flat 
              bordered 
              clickable
              v-ripple
              :aria-label="`Navigate to Settings`"
              @click="navigate('settings')"
              :class="{ 'active-card': selectedSection === 'settings' }"
            >
              <q-card-section class="stats-content">
                <div class="stats-icon">
                  <q-icon name="settings" :color="selectedSection === 'settings' ? 'white' : 'grey-8'" size="22px" />
                </div>
                <div class="stats-info">
                  <div class="stats-label">Settings</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="main-layout">
        <div class="main-content">
          <template v-if="selectedSection === 'applications'">
            <MyApplications @view-application="viewApplication" />
          </template>
          <template v-else-if="selectedSection === 'bookmarks'">
            <BookmarkedJobs :jobs="bookmarkedJobs" @remove="handleRemove" />
          </template>
          <template v-else-if="selectedSection === 'profile'">
            <UserProfile />
          </template>
          <template v-else-if="selectedSection === 'notifications'">
            <NotificationComponent />
          </template>

          <template v-else-if="selectedSection === 'settings'">
            <SettingsComponent />
          </template>
        </div>
      </div>
    </div>

    <CompleteProfileModal v-model="showProfileModal" />
  </div>
</template>

<script setup>
import AppHeader from '../components/HeaderPart.vue';
import JobSeekerHeader from 'components/JobSeekerHeader.vue';
import CompleteProfileModal from 'components/CompleteProfileModal.vue';
import BookmarkedJobs from 'components/BookmarkedJobs.vue';
import MyApplications from 'components/MyApplications.vue';
import UserProfile from 'src/components/UserProfile.vue';
import NotificationComponent from 'src/components/NotificationsPage.vue';
import SettingsComponent from 'src/components/SettingsPage.vue';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { bookmarkService } from '../services/bookmarkService';
import { authHelpers } from '../services/auth.service';

const bookmarkedJobs = ref([]);
const showProfileModal = ref(false);
const userName = 'John';
const selectedSection = ref('applications');
const router = useRouter();
const userId = authHelpers.getCurrentUser()?.id;

// Simulated data for navigation cards
const applications = ref([
  { id: 1, jobTitle: 'Software Engineer', status: 'Pending', date: '2025-08-10' },
  { id: 2, jobTitle: 'Data Analyst', status: 'Under Review', date: '2025-08-12' },
  { id: 3, jobTitle: 'Product Manager', status: 'Pending', date: '2025-08-15' },
]);

const notifications = ref([
  { message: 'Profile updated successfully!', timestamp: '10:20 PM IST, Aug 02, 2025', type: 'success' },
  { message: 'New message received from Admin.', timestamp: '09:45 PM IST, Aug 02, 2025', type: 'info' },
  { message: 'Your subscription is expiring soon!', timestamp: '08:00 PM IST, Aug 02, 2025', type: 'warning' },
  { message: 'Failed to process payment.', timestamp: '07:30 PM IST, Aug 02, 2025', type: 'error' },
  { message: 'Application submitted!', timestamp: '06:00 PM IST, Aug 01, 2025', type: 'success' },
]);

const goToResume = () => router.push('/resume-builder');

const viewApplication = (applicationId) => {
  router.push(`/application/${applicationId}`);
};

const navigate = (section) => {
  selectedSection.value = section;
};

const fetchBookmarks = async () => {
  try {
    if (!userId) return;
    const jobs = await bookmarkService.getBookmarkedJobs(userId);
    bookmarkedJobs.value = jobs.map(b => ({
      id: b.id,
      title: b.title,
      company: b.company,
      location: b.location,
      salary: b.salary,
      skills: Array.isArray(b.skills) ? b.skills : JSON.parse(b.skills),
      posted: b.posted,
      type: b.type,
    }));
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
  }
};

const handleRemove = async (jobId) => {
  const original = [...bookmarkedJobs.value];
  bookmarkedJobs.value = bookmarkedJobs.value.filter(job => job.id !== jobId);
  try {
    await bookmarkService.removeBookmark(userId, jobId);
    console.log('Bookmark removed');
  } catch (error) {
    console.error('Failed to remove bookmark:', error);
    bookmarkedJobs.value = original; // Rollback
  }
};

onMounted(() => {
  fetchBookmarks();
});
</script>

<style scoped>
/* Root Layout */
.job-seeker-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* Static App Header */
.static-header {
  flex-shrink: 0;
  background: linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  z-index: 100;
  position: sticky;
  top: 0;
}

/* Scrollable Body Section */
.scrollable-body {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
}

/* Navigation Cards Section */
.stats-section {
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.stats-card {
  border-radius: 8px;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
  height: 60px;
  cursor: pointer;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  border-color: #3b82f6;
  background: linear-gradient(145deg, #f8fafc 0%, #eff6ff 100%);
}

.stats-card.active-card {
  background: linear-gradient(145deg, #3b82f6 0%, #1e40af 100%);
  border-color: #1e3a8a;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.stats-card.active-card .stats-label,
.stats-card.active-card .stats-badge {
  color: #ffffff;
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px;
  position: relative;
}

.stats-icon {
  background: rgba(59, 130, 246, 0.15);
  border-radius: 6px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, background 0.3s ease;
}

.stats-card:hover .stats-icon,
.stats-card.active-card .stats-icon {
  transform: scale(1.1);
  background: rgba(59, 130, 246, 0.25);
}

.stats-card.active-card .stats-icon {
  background: rgba(255, 255, 255, 0.2);
}

.stats-label {
  font-size: 10px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
}

.stats-badge {
  font-size: 9px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  position: absolute;
  top: 6px;
  right: 6px;
  transition: transform 0.3s ease;
}

.stats-card:hover .stats-badge {
  transform: scale(1.1);
}

/* Main Content Area */
.main-layout {
  display: flex;
  height: calc(100vh - 80px); /* Adjusted for header and stats-section */
  overflow: hidden;
}

/* Main Content - Independently Scrollable */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: #f9fbfc;
  box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.04);
}

/* Enhanced Scrollbar */
.main-content::-webkit-scrollbar,
.scrollable-body::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-thumb,
.scrollable-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-track,
.scrollable-body::-webkit-scrollbar-track {
  background: transparent;
}

/* Job Card Styling */
.job-card {
  border-radius: 14px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
}

.job-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

/* Pagination Buttons */
.styled-pagination .q-pagination__content {
  gap: 14px;
}

.styled-pagination .q-btn {
  border-radius: 999px !important;
  min-width: 42px;
  height: 42px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  background: #e2e8f0;
  transition: all 0.3s ease;
  border: none;
}

.styled-pagination .q-btn:hover:not(.q-btn--disabled):not(.q-btn--active) {
  background: #dbeafe;
  color: #1e40af;
}

.styled-pagination .q-btn--active {
  background: #1e40af !important;
  color: #ffffff !important;
  box-shadow: 0 0 0 4px rgba(30, 64, 175, 0.2);
}

/* Primary CTA Button */
.primary-btn {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  border-radius: 25px;
  color: #ffffff;
  padding: 12px 28px;
  font-weight: 600;
  font-size: 15px;
  transition: background 0.3s ease, transform 0.3s ease;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #1e40af, #1e3a8a);
  transform: scale(1.04);
}

/* Section Headings */
h6, .text-h6 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.text-caption {
  font-size: 13px;
  color: #64748b;
}

/* Navigation Button */
.nav-btn {
  font-weight: 500;
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 20px;
  color: #1e40af;
  background: #eff6ff;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.nav-btn:hover:not(:disabled) {
  background: #dbeafe;
  border-color: #3b82f6;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    padding: 20px 28px;
  }

  .stats-section {
    padding: 10px 14px;
  }

  .stats-col {
    flex: 0 0 19.5%;
    max-width: 19.5%;
  }

  .stats-card {
    height: 55px;
  }

  .stats-content {
    padding: 8px;
    gap: 5px;
  }

  .stats-label {
    font-size: 9px;
  }

  .stats-icon {
    padding: 3px;
  }

  .stats-badge {
    min-width: 16px;
    height: 16px;
    font-size: 8px;
    top: 4px;
    right: 4px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px 24px;
  }

  .stats-section {
    padding: 8px 12px;
  }

  .stats-col {
    flex: 0 0 19.5%;
    max-width: 19.5%;
  }

  .stats-card {
    height: 50px;
  }

  .stats-content {
    padding: 6px;
    gap: 4px;
  }

  .stats-label {
    font-size: 8px;
  }

  .stats-icon {
    padding: 2px;
  }

  .stats-icon q-icon {
    size: 20px;
  }

  .stats-badge {
    min-width: 14px;
    height: 14px;
    font-size: 7px;
    top: 3px;
    right: 3px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 12px 20px;
  }

  .stats-section {
    padding: 6px 10px;
  }

  .stats-col {
    flex: 0 0 19%;
    max-width: 19%;
  }

  .stats-card {
    height: 45px;
  }

  .stats-content {
    padding: 5px;
    gap: 3px;
  }

  .stats-label {
    font-size: 7px;
  }

  .stats-icon {
    padding: 2px;
  }

  .stats-icon q-icon {
    size: 18px;
  }

  .stats-badge {
    min-width: 12px;
    height: 12px;
    font-size: 6px;
    top: 2px;
    right: 2px;
  }
}

/* Accessibility */
.stats-card:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

@media (prefers-contrast: high) {
  .stats-card {
    border: 2px solid #1e3a8a;
  }

  .stats-card.active-card {
    border: 2px solid #ffffff;
  }

  .stats-label {
    color: #1f2937;
  }

  .stats-icon {
    background: #dbeafe;
  }

  .stats-card.active-card .stats-label,
  .stats-card.active-card .stats-badge {
    color: #ffffff;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stats-card,
  .stats-icon,
  .stats-badge,
  .job-card,
  .primary-btn,
  .nav-btn,
  .styled-pagination .q-btn {
    transition: none;
  }
}
</style>