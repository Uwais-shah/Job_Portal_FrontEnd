<template>
  <AppHeader class="sticky-header" />
  <div class="page-wrapper row no-wrap">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-section logo-section flex items-center q-gutter-sm q-pa-md">
        <q-avatar icon="business_center" color="white" text-color="primary" />
        <div>
          <div class="text-h6 text-white">JobHub</div>
          <div class="text-caption text-blue-grey-3">Employer Portal</div>
        </div>
      </div>
      <div class="sidebar-section q-pt-sm q-pb-none q-px-md">
        <div class="text-subtitle1 text-weight-medium text-white">{{ employer.name }}</div>
        <div class="text-caption text-blue-grey-4">{{ employer.email }}</div>
      </div>
      <div class="sidebar-section q-pt-md q-pb-none">
        <q-list class="nav-list">
          <q-item v-for="link in links" :key="link.label" :active="selected === link.label"
            active-class="active-link" clickable v-ripple @click="navigate(link)">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>{{ link.label }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <!-- Content -->
    <div class="content-area column q-pa-md">
      <div class="row justify-between items-center q-mb-md">
        <div>
          <div class="text-h5 text-weight-bold content-title">Candidate Pipeline</div>
          <div class="text-subtitle1 subtitle-text">Review and manage your applicants.</div>
        </div>
      </div>

      <!-- Filters -->
      <q-card flat class="q-mb-md control-bar">
        <div class="row items-center q-pa-sm q-gutter-md">
          <div class="col-12 col-md-3">
            <q-select filled dense v-model="selectedJobId" :options="jobOptions" label="Filter by Job"
              emit-value map-options options-dense />
          </div>
          <div class="col-12 col-md-3">
            <q-input filled dense v-model="searchQuery" placeholder="Search candidate name..." debounce="300"
              :disable="!selectedJobId" clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select filled dense v-model="experienceFilter" :options="experienceOptions" 
              label="Experience Level" emit-value map-options options-dense clearable
              :disable="!selectedJobId" />
          </div>
          <div class="col-12 col-md-3">
            <q-select filled dense v-model="statusFilter" :options="statusFilterOptions" 
              label="Status Filter" emit-value map-options options-dense clearable
              :disable="!selectedJobId" />
          </div>
        </div>
      </q-card>

      <!-- Action Bar for Selected Candidates -->
      <div v-if="selectedCandidates.size > 0" class="action-bar q-mb-md q-pa-md">
        <div class="row items-center justify-between">
          <div class="text-subtitle1">
            {{ selectedCandidates.size }} candidate{{ selectedCandidates.size > 1 ? 's' : '' }} selected
          </div>
          <div class="row q-gutter-sm">
            <q-btn label="Send Email" color="primary" icon="mail" @click="openEmailDialog" />
            <q-btn label="Reject Selected" color="negative" icon="close" @click="rejectSelectedCandidates" />
            <q-btn label="Clear Selection" color="grey" outline @click="clearSelection" />
          </div>
        </div>
      </div>

      <!-- Candidates Cards List -->
      <div v-if="selectedJobId" class="candidate-cards-wrapper column q-gutter-md">
        <!-- Active Candidates (Non-rejected) -->
        <div v-if="activeCandidates.length > 0">
          <div class="section-header q-mb-sm">
            <div class="text-h6 text-weight-medium">Active Candidates ({{ activeCandidates.length }})</div>
          </div>
          <q-card 
            v-for="candidate in activeCandidates" 
            :key="candidate.id" 
            class="candidate-card-row q-pa-md"
            :class="{ 'selected-card': selectedCandidates.has(candidate.id) }"
            @click="viewCandidate(candidate)"
          >
            <div class="row items-center no-wrap">
              <q-checkbox 
                :model-value="selectedCandidates.has(candidate.id)" 
                @update:model-value="val => toggleCandidateSelection(candidate, val)" 
                dense
                @click.stop
              />

              <q-avatar size="48px" color="light-blue-1" text-color="primary" class="text-weight-bold q-mr-md">
                {{ candidate.name.charAt(0) }}
              </q-avatar>
              <div class="column flex-grow">
                <div class="text-weight-bold">{{ candidate.name }}</div>
                <div class="text-caption">
                  Applied {{ formatTimeAgo(candidate.appliedDate) }} | 
                  Experience: {{ getExperienceLevel(candidate.id) }}
                </div>
              </div>
              <q-badge rounded :label="candidate.status" class="status-badge" :color="getStatusColor(candidate.status)" />
            </div>
          </q-card>
        </div>

        <!-- Rejected Candidates -->
        <div v-if="rejectedCandidates.length > 0" class="q-mt-lg">
          <q-expansion-item
            v-model="showRejectedCandidates"
            icon="visibility_off"
            :label="`Rejected Candidates (${rejectedCandidates.length})`"
            class="rejected-section"
          >
            <div class="q-pa-md">
              <q-card 
                v-for="candidate in rejectedCandidates" 
                :key="candidate.id" 
                class="candidate-card-row rejected-card q-pa-md q-mb-sm"
                @click="viewCandidate(candidate)"
              >
                <div class="row items-center no-wrap">
                  <q-avatar size="48px" color="grey-4" text-color="grey-8" class="text-weight-bold q-mr-md">
                    {{ candidate.name.charAt(0) }}
                  </q-avatar>
                  <div class="column flex-grow">
                    <div class="text-weight-bold text-grey-7">{{ candidate.name }}</div>
                    <div class="text-caption text-grey-5">
                      Applied {{ formatTimeAgo(candidate.appliedDate) }} | 
                      Experience: {{ getExperienceLevel(candidate.id) }}
                    </div>
                  </div>
                  <q-badge rounded :label="candidate.status" class="status-badge" :color="getStatusColor(candidate.status)" />
                </div>
              </q-card>
            </div>
          </q-expansion-item>
        </div>
      </div>

      <!-- Empty State -->
      <q-card v-else class="flex flex-center" style="height: 50vh; background: transparent;" flat>
        <div class="text-center subtitle-text">
          <q-icon name="work_outline" size="4rem" />
          <div class="text-h6 q-mt-md">Please select a job to view candidates.</div>
        </div>
      </q-card>

      <!-- Email Dialog -->
      <q-dialog v-model="showEmailDialog" persistent>
        <q-card style="width: 600px; max-width: 90vw;">
          <q-card-section>
            <div class="text-h6">Send Email to Selected Candidates</div>
            <div class="text-subtitle2 q-mt-sm text-grey-6">
              Sending to {{ selectedCandidateEmails.length }} candidate{{ selectedCandidateEmails.length > 1 ? 's' : '' }}
            </div>
          </q-card-section>

          <q-card-section>
            <div class="q-mb-md">
              <div class="text-weight-medium q-mb-sm">Recipients:</div>
              <q-chip 
                v-for="email in selectedCandidateEmails" 
                :key="email" 
                :label="email"
                color="primary"
                text-color="white"
                dense
                class="q-mr-xs q-mb-xs"
              />
            </div>

            <q-input
              v-model="emailSubject"
              label="Subject *"
              filled
              dense
              class="q-mb-md"
              :rules="[val => !!val || 'Subject is required']"
            />

            <q-input
              v-model="emailBody"
              label="Message *"
              type="textarea"
              filled
              rows="8"
              :rules="[val => !!val || 'Message is required']"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="grey" @click="closeEmailDialog" />
            <q-btn 
              label="Send Email" 
              color="primary" 
              @click="sendBulkEmail"
              :loading="sendingEmail"
              :disable="!emailSubject || !emailBody"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Candidate Details Modal -->
      <q-dialog v-model="showCandidateDetail">
        <q-card v-if="selectedCandidate" style="width: 600px; height: 700px; max-width: 90vw; max-height: 90vh;">
          
          <!-- Scrollable content -->
          <div style="height: 100%; overflow-y: auto;">
            <q-card-section class="q-pa-md">
              <div class="row items-center justify-between">
                <q-item class="q-pa-none">
                  <q-item-section avatar>
                    <q-avatar size="52px" color="primary" text-color="white">
                      <img v-if="selectedCandidateProfile.photo" :src="selectedCandidateProfile.photo" alt="Candidate Photo" />
                      <template v-else>{{ selectedCandidate.name.charAt(0) }}</template>
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-h6">{{ selectedCandidate.name }}</q-item-label>
                    <q-item-label caption>Applied for {{ getJobTitle(selectedCandidate.jobId) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-btn icon="close" flat round dense v-close-popup />
              </div>
            </q-card-section>

            <q-separator />

            <q-tabs v-model="detailTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify">
              <q-tab name="profile" label="Profile" />
              <q-tab name="application" label="Application" />
              <q-tab name="notes" label="Notes" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="detailTab" animated>
              <!-- Profile Tab -->
              <q-tab-panel name="profile" class="q-pa-md q-gutter-y-md">
                <div v-if="selectedCandidateProfile">
                  <div class="row items-center">
                    <q-icon name="email" class="q-mr-sm text-grey-7" /> {{ selectedCandidateProfile.email }}
                  </div>
                  <div class="row items-center q-mt-sm">
                    <q-icon name="phone" class="q-mr-sm text-grey-7" /> {{ selectedCandidateProfile.phoneNumber }}
                  </div>
                  <q-btn icon="description" label="Download Resume" color="primary" outline :href="selectedCandidateProfile.resume" target="_blank" class="q-mt-sm"/>

                  <div class="q-mt-md">
                    <div class="text-weight-medium q-mb-sm">Skills</div>
                    <q-chip v-for="skill in selectedCandidateProfile.skills" :key="skill" outline color="primary" text-color="white">{{ skill }}</q-chip>
                  </div>

                  <div class="q-mt-md">
                    <div class="text-weight-medium">Experience</div>
                    <div v-for="exp in selectedCandidateProfile.experience" :key="exp.id" class="q-mb-sm">
                      <div class="text-bold">{{ exp.title }} at {{ exp.company }}</div>
                      <div class="text-caption">{{ formatDate(exp.start_date) }} to {{ formatDate(exp.end_date) || 'Present' }}</div>
                      <div class="text-body2">{{ exp.description }}</div>
                    </div>
                  </div>

                  <div class="q-mt-md">
                    <div class="text-weight-medium">Education</div>
                    <div v-for="edu in selectedCandidateProfile.education" :key="edu.id" class="q-mb-sm">
                      <div class="text-bold">{{ edu.degree }} - {{ edu.school }}</div>
                      <div class="text-caption">{{ formatDate(edu.start_date) }} to {{ formatDate(edu.end_date) }}</div>
                      <div class="text-body2">{{ edu.field }}</div>
                    </div>
                  </div>
                </div>
              </q-tab-panel>

              <!-- Application Tab -->
              <q-tab-panel name="application">
                {{ selectedCandidate.coverLetter }}
              </q-tab-panel>

              <!-- Notes Tab -->
              <q-tab-panel name="notes">
                {{ selectedCandidate.notes || 'No notes added yet...' }}
              </q-tab-panel>
            </q-tab-panels>
          </div>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Reject" color="negative" @click="changeCandidateStatus(selectedCandidate, 'Rejected')" v-close-popup/>
            <q-btn v-if="selectedCandidate.status !== 'Hired'" label="Next Stage" color="primary" @click="moveToNextStage(selectedCandidate)" v-close-popup />
          </q-card-actions>

        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from 'src/services/auth.service.js';
import AppHeader from 'src/components/HeaderPart.vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const employer = ref({ name: 'Acme Corp', email: 'contact@acmecorp.com' });
const selected = ref('Candidates');

const companyId = 22; // replace with actual logged-in company ID

// Selection and Email State
const selectedCandidates = ref(new Set());
const showEmailDialog = ref(false);
const emailSubject = ref('');
const emailBody = ref('');
const sendingEmail = ref(false);
const selectedCandidate= ref(null);
// Filter State
const experienceFilter = ref(null);
const statusFilter = ref(null);
const showRejectedCandidates = ref(false);

// API State
const jobs = ref([]);
const applications = ref([]);
const allCandidates = ref([]);
const selectedCandidateProfile = ref(null);
const candidateProfiles = ref(new Map()); // Cache for candidate profiles

// Page State
const selectedJobId = ref(null);
const searchQuery = ref('');
const showCandidateDetail = ref(false);
const detailTab = ref('profile');
const stages = ['New Applicant', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected'];
const selectedCandidateCard = ref(null);

// Filter Options
const experienceOptions = [
  { label: 'Entry Level (0-2 years)', value: 'entry' },
  { label: 'Mid Level (3-5 years)', value: 'mid' },
  { label: 'Senior Level (6+ years)', value: 'senior' }
];

const statusFilterOptions = [
  { label: 'All Active', value: 'active' },
  { label: 'New Applicants', value: 'New Applicant' },
  { label: 'In Screening', value: 'Screening' },
  { label: 'In Interview', value: 'Interview' },
  { label: 'Offered', value: 'Offered' },
  { label: 'Hired', value: 'Hired' },
  { label: 'Rejected', value: 'Rejected' }
];

// Selection Functions
const toggleCandidateSelection = (candidate, selected) => {
  if (selected) {
    selectedCandidates.value.add(candidate.id);
  } else {
    selectedCandidates.value.delete(candidate.id);
  }
};

const clearSelection = () => {
  selectedCandidates.value.clear();
};

// Email Functions
const openEmailDialog = () => {
  if (selectedCandidates.value.size === 0) {
    $q.notify({
      type: 'warning',
      message: 'Please select candidates first'
    });
    return;
  }
  emailSubject.value = '';
  emailBody.value = '';
  showEmailDialog.value = true;
};

const closeEmailDialog = () => {
  showEmailDialog.value = false;
  emailSubject.value = '';
  emailBody.value = '';
};

const sendBulkEmail = async () => {
  if (!emailSubject.value || !emailBody.value) {
    $q.notify({
      type: 'warning',
      message: 'Please fill in both subject and message'
    });
    return;
  }

  sendingEmail.value = true;
  try {
    const recipientEmails = selectedCandidateEmails.value;
    
    // Call your backend API to send bulk email
   await api.post('/emails/bulk', {
  recipients: recipientEmails,
  subject: emailSubject.value,
  text: emailBody.value,       // <-- match backend "text"
  companyId: companyId
});



    $q.notify({
      type: 'positive',
      message: `Email sent successfully to ${recipientEmails.length} candidate${recipientEmails.length > 1 ? 's' : ''}!`
    });

    closeEmailDialog();
    clearSelection();
  } catch (error) {
    console.error('Error sending bulk email:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to send email. Please try again.'
    });
  } finally {
    sendingEmail.value = false;
  }
};

// Bulk Actions
const rejectSelectedCandidates = async () => {
  if (selectedCandidates.value.size === 0) {
    $q.notify({
      type: 'warning',
      message: 'Please select candidates first'
    });
    return;
  }

  try {
    const promises = Array.from(selectedCandidates.value).map(async (id) => {
      const candidate = allCandidates.value.find(c => c.id === id);
      if (candidate && candidate.status !== 'Rejected') {
        await changeCandidateStatus(candidate, 'Rejected');
      }
    });

    await Promise.all(promises);
    
    $q.notify({
      type: 'positive',
      message: `Successfully rejected ${selectedCandidates.value.size} candidate${selectedCandidates.value.size > 1 ? 's' : ''}`
    });
    
    clearSelection();
  } catch (error) {
    console.error('Error rejecting candidates:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to reject some candidates. Please try again.'
    });
  }
};

// Fetch functions
const fetchJobs = async () => {
  try {
    const res = await api.get(`/jobs/jobs/company/${companyId}`);
    jobs.value = res.data.jobs || [];
  } catch (err) {
    console.error('Error fetching jobs', err);
  }
};

const fetchCompanyCandidates = async () => {
  try {
    const res = await api.get(`/applications/company-candidates/${companyId}`);
    applications.value = res.data.applications || [];
    allCandidates.value = applications.value.map(app => ({
      id: app.jobSeeker.id,
      name: app.jobSeeker.name,
      email: app.jobSeeker.email,
      jobId: app.job.id,
      jobTitle: app.job.title,
      status: formatStatus(app.status),
      appliedDate: app.applied_at,
      resumeUrl: app.resume_link,
      coverLetter: app.cover_letter,
      notes: '',
      applicationId: app.id
    }));
  } catch (err) {
    console.error('Error fetching candidates', err);
  }
};

const fetchCandidateProfile = async (userId) => {
  // Check cache first
  if (candidateProfiles.value.has(userId)) {
    selectedCandidateProfile.value = candidateProfiles.value.get(userId);
    return;
  }

  try {
    const res = await api.get(`/profile/${userId}/public`);
    const profile = res.data;
    candidateProfiles.value.set(userId, profile);
    selectedCandidateProfile.value = profile;
  } catch (err) {
    console.error('Error fetching candidate profile', err);
  }
};

// Helper function to calculate experience level
const getExperienceLevel = (candidateId) => {
  const profile = candidateProfiles.value.get(candidateId);
  if (!profile || !profile.experience || profile.experience.length === 0) {
    return 'Not specified';
  }

  // Calculate total years of experience
  let totalYears = 0;
  profile.experience.forEach(exp => {
    const startDate = new Date(exp.start_date);
    const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
    const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
    totalYears += years;
  });

  if (totalYears < 2) return 'Entry Level (0-2 years)';
  if (totalYears < 6) return 'Mid Level (3-5 years)';
  return 'Senior Level (6+ years)';
};

// Computed properties
const jobOptions = computed(() => jobs.value.map(job => ({ label: job.title, value: job.id })));

const selectedCandidateEmails = computed(() => {
  return Array.from(selectedCandidates.value).map(id => {
    const candidate = allCandidates.value.find(c => c.id === id);
    return candidate?.email;
  }).filter(Boolean);
});

const filteredCandidates = computed(() => {
  if (!selectedJobId.value) return [];
  
  let candidates = allCandidates.value.filter(c => c.jobId === selectedJobId.value);
  
  // Search filter
  if (searchQuery.value) {
    candidates = candidates.filter(c => 
      c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  // Experience filter
  if (experienceFilter.value) {
    candidates = candidates.filter(c => {
      const expLevel = getExperienceLevel(c.id);
      const levelMap = {
        'entry': 'Entry Level',
        'mid': 'Mid Level',
        'senior': 'Senior Level'
      };
      return expLevel.includes(levelMap[experienceFilter.value]);
    });
  }
  
  // Status filter
  if (statusFilter.value) {
    if (statusFilter.value === 'active') {
      candidates = candidates.filter(c => c.status !== 'Rejected');
    } else {
      candidates = candidates.filter(c => c.status === statusFilter.value);
    }
  }
  
  return candidates;
});

const activeCandidates = computed(() => {
  return filteredCandidates.value.filter(c => c.status !== 'Rejected');
});

const rejectedCandidates = computed(() => {
  return filteredCandidates.value.filter(c => c.status === 'Rejected');
});

// Lifecycle
onMounted(async () => {
  await fetchJobs();
  await fetchCompanyCandidates();
  
  // Pre-fetch profiles for better UX
  const profilePromises = allCandidates.value.map(candidate => 
    fetchCandidateProfile(candidate.id).catch(() => {}) // Ignore errors for batch fetch
  );
  await Promise.all(profilePromises);
  
  const jobIdFromQuery = parseInt(route.query.jobId);
  if (jobIdFromQuery && jobs.value.some(j => j.id === jobIdFromQuery)) {
    selectedJobId.value = jobIdFromQuery;
  }
});

watch(selectedJobId, () => { 
  searchQuery.value = '';
  experienceFilter.value = null;
  statusFilter.value = null;
  clearSelection();
});

// Helper functions
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const options = { year: 'numeric', month: 'short' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

const formatStatus = (s) => {
  const map = { applied: 'New Applicant', hired: 'Hired', rejected: 'Rejected' };
  return map[s] || (s.charAt(0).toUpperCase() + s.slice(1));
};

const getStatusColor = (status) => {
  const colorMap = {
    'New Applicant': 'blue', 'Screening': 'orange', 'Interview': 'purple',
    'Offered': 'teal', 'Hired': 'positive', 'Rejected': 'negative'
  };
  return colorMap[status] || 'grey';
};

const getJobTitle = (jobId) => jobs.value.find(j => j.id === jobId)?.title || 'N/A';

const viewCandidate = async (candidate) => {
  selectedCandidate.value = { ...candidate };
  detailTab.value = 'profile';
  await fetchCandidateProfile(candidate.id);
  showCandidateDetail.value = true;
};

const changeCandidateStatus = async (candidate, newStatus) => {
  try {
    await api.put(`/applications/${candidate.applicationId}/status`, { status: newStatus.toLowerCase() });
    const original = allCandidates.value.find(c => c.id === candidate.id);
    if (original) {
      original.status = newStatus;
    }
    if (selectedCandidate.value && selectedCandidate.value.id === candidate.id) {
      selectedCandidate.value.status = newStatus;
    }
  } catch (err) {
    console.error('Error updating status', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to update candidate status'
    });
  }
};

const moveToNextStage = (candidate) => {
  const i = stages.indexOf(candidate.status);
  if (i >= 0 && i < stages.indexOf('Hired')) {
    changeCandidateStatus(candidate, stages[i + 1]);
  }
};

const formatTimeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  let interval = seconds / 86400;
  if (interval > 7) return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
};

// Sidebar Links
const links = [
  { label: 'Dashboard Overview', icon: 'dashboard', to: '/employer-portal' },
  { label: 'Posted Jobs', icon: 'work', to: '/posted-jobs' },
  { label: 'Post New Job', icon: 'add_box', to: '/post-job' },
  { label: 'Candidates', icon: 'groups', to: '/candidates' },
  { label: 'Messages', icon: 'mail', to: '/employer-messages' },
  { label: 'Company Profile', icon: 'domain', to: '/company-profile' },
  { label: 'Settings', icon: 'settings', to: '/employer-settings' }
];

const navigate = (link) => {
  selected.value = link.label;
  if (link.to) router.push(link.to);
};
</script>

<style scoped>
.portal-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.selected-card {
  border: 2px solid #1976d2;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  transform: translateY(-2px);
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.page-wrapper {
  flex-grow: 1;
  overflow: hidden;
}

.sidebar, .content-area {
  height: 100%;
}

.content-area {
  flex: 1;
  overflow-y: auto;
}

/* Page Wrapper & Sidebar */
.page-wrapper {
  height: 100vh;
  background-color: #F0F7FF;
}

.sidebar {
  width: 260px;
  background-color: #1565c0;
  color: #f0f4f8;
  display: flex;
  flex-direction: column;
}

.sidebar-section { 
  border-bottom: 1px solid #243B55; 
}

.nav-list .q-item { 
  color: #BCCCDC; 
  padding: 12px; 
  margin: 4px 12px; 
  border-radius: 8px; 
}

.active-link { 
  background-color: #00529b !important; 
  color: #ffffff !important; 
  font-weight: 600; 
}

/* Content Area */
.content-title { 
  color: #0D1B2A; 
}

.subtitle-text { 
  color: #5A7184; 
}

.control-bar {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #DDE8F5;
}

/* Action Bar */
.action-bar {
  background-color: #E3F2FD;
  border-radius: 12px;
  border: 1px solid #BBDEFB;
}

/* Section Headers */
.section-header {
  padding: 8px 0;
  border-bottom: 2px solid #E1F5FE;
}

/* Candidate Cards */
.candidate-cards-wrapper {
  flex-grow: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.candidate-card-row {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #DDE8F5;
  background-color: #ffffff;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
}

.candidate-card-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.rejected-card {
  opacity: 0.7;
  background-color: #FAFAFA;
  border-color: #E0E0E0;
}

.rejected-section {
  background-color: #F5F5F5;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
}

.status-badge {
  margin-left: auto;
  font-weight: 600;
  text-transform: capitalize;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .page-wrapper {
    flex-direction: column;
  }
  
  .candidate-card-row {
    margin: 4px 0;
  }
}

/* Animation Classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>