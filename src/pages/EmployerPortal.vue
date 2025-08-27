<template>
  <div class="employer-portal">
    <AppHeader class="sticky-header" />
    <div class="page-wrapper row">
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
              active-class="active-link" clickable v-ripple @click="navigate(link)" class="nav-item">
              <q-item-section avatar>
                <q-icon :name="link.icon" />
              </q-item-section>
              <q-item-section>
                <div class="row items-center">
                  <span>{{ link.label }}</span>
                  <q-badge v-if="link.badge && link.badge.value" color="red" floating transparent class="q-ml-sm">
                    {{ link.badge.value }}
                  </q-badge>
                </div>
              </q-item-section>
              <q-tooltip v-if="link.highlight" anchor="center right" self="center left" :offset="[5, 10]">
                Post a new job opening
              </q-tooltip>
            </q-item>
          </q-list>
        </div>
      </div>

      <div class="content-area column q-pa-md q-pa-lg-lg">
        <q-banner v-if="verificationStatus === 'pending'" class="bg-blue-1 text-blue-9 q-mb-lg" rounded>
          <template v-slot:avatar>
            <q-icon name="pending" color="blue-7" size="2em" />
          </template>
          <div class="text-weight-medium">Your company is under review</div>
          <div>Your company profile is currently being reviewed by our team. This process typically takes 1-2 business
            days. You can still post jobs, but they will be marked as pending until your company is verified.</div>
        </q-banner>

        <q-banner v-else-if="verificationStatus === 'rejected'" class="bg-red-1 text-red-9 q-mb-lg" rounded>
          <template v-slot:avatar>
            <q-icon name="warning" color="red-7" size="2em" />
          </template>
          <div class="text-weight-medium">Company Verification Required</div>
          <div>Your company verification was rejected. Reason: {{ rejectionReason || 'Not specified' }}. Please update
            your company information and submit for review again.</div>
          <template v-slot:action>
            <q-btn flat color="red-8" label="Update Company Profile" to="/company-profile" />
          </template>
        </q-banner>

        <q-banner v-if="activeBroadcast" inline-actions rounded class="q-mb-lg broadcast-banner">
          <template v-slot:avatar>
            <q-icon name="campaign" color="white" />
          </template>
          <div class="text-weight-medium text-white">
            {{ activeBroadcast.text }}
            <div class="text-caption q-mt-xs opacity-8">(Expires on {{ new
              Date(activeBroadcast.expiry).toLocaleString() }})</div>
          </div>
        </q-banner>

        <div class="row justify-between items-center q-mb-lg">
          <div>
            <div class="text-h5 text-weight-bold content-title">Welcome, {{ employer.name }}!</div>
            <div class="text-subtitle1 subtitle-text">Here's your overview for {{ todaysDate }}.</div>
          </div>
        </div>

        <div class="row q-col-gutter-lg q-mb-lg">
          <div class="col-12 col-sm-6 col-md-3" v-for="stat in dashboardStats" :key="stat.label">
            <q-card class="stat-card full-height" flat bordered>
              <q-card-section class="flex items-center q-pa-md">
                <q-icon :name="stat.icon" :color="stat.iconColor" size="2.8em" class="q-mr-md" />
                <div>
                  <div class="text-h4 text-weight-bolder stat-value">{{ stat.value }}</div>
                  <div class="text-subtitle2 stat-label">{{ stat.label }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-lg-7">
            <q-card flat bordered class="q-mb-lg">
              <q-card-section>
                <div class="text-h6 content-title">Application Trends (Last 7 Days)</div>
              </q-card-section>
              <q-card-section>
                <apexchart type="bar" height="350" :options="chartOptions" :series="chartSeries"></apexchart>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-lg-5">
            <q-card flat bordered class="q-mb-lg">
              <q-card-section>
                <div class="text-h6 content-title">Action Required</div>
              </q-card-section>
              <q-list separator>
                <q-item v-for="item in actionItems" :key="item.title" clickable v-ripple @click="router.push(item.to)">
                  <q-item-section avatar>
                    <q-avatar :icon="item.icon" color="light-blue-1" text-color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium list-item-title">{{ item.title }}</q-item-label>
                    <q-item-label caption lines="1">{{ item.subtitle }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" class="subtitle-text" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>

            <q-card flat bordered class="q-mb-lg interview-card">
              <q-card-section>
                <div class="text-h6 content-title">Upcoming Interviews</div>
              </q-card-section>
              <q-list separator class="interview-list">
                <q-item v-for="interview in upcomingInterviews" :key="interview.id">
                  <q-item-section avatar>
                    <q-avatar color="cyan-1" text-color="cyan-8" icon="event" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium list-item-title">{{ interview.candidateName }}</q-item-label>
                    <q-item-label caption>For: {{ interview.jobTitle }}</q-item-label>
                  </q-item-section>
                  <q-item-section side class="text-right">
                    <q-item-label class="text-weight-medium text-cyan-9">{{ interview.date }}</q-item-label>
                    <q-item-label caption>{{ interview.time }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </div>
      </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import VueApexCharts from 'vue3-apexcharts';
import { api } from 'src/boot/axios';
import AppHeader from 'src/components/HeaderPart.vue';
import { authHelpers } from 'src/services/auth.service';

const apexchart = VueApexCharts;
const router = useRouter();
const $q = useQuasar();

const dashboardStats = ref([
  { value: 0, label: 'Total Jobs', icon: 'summarize', iconColor: 'blue-5', key: 'totalJobs' },
  { value: 0, label: 'Active Jobs', icon: 'fact_check', iconColor: 'blue-6', key: 'activeJobs' },
  { value: 0, label: 'Total Applicants', icon: 'groups', iconColor: 'blue-7', key: 'totalApplicants' },
  { value: 0, label: 'Total Reviews', icon: 'rate_review', iconColor: 'blue-8', key: 'totalReviews' },
  { value: 0, label: 'Total Reports', icon: 'report', iconColor: 'red-6', key: 'totalReports' }
]);

const navStats = ref({
  pending_jobs: 2,
});

const fetchDashboardStats = async () => {
  try {
    const token = authHelpers.getToken();
    if (!token) {
      console.warn('No authentication token found');
      return;
    }
    
    // Get company ID from the employer data
    const companyId = employer.value?.id;
    if (!companyId) {
      console.error('Company ID not found');
      return;
    }
    
    // Fetch company stats with the correct endpoint
    const response = await api.get(`/company/${companyId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (response.data && response.data.success) {
      const stats = response.data.data;
      
      // Update dashboard stats with real data
      dashboardStats.value.forEach(stat => {
        if (stats[stat.key] !== undefined) {
          stat.value = stats[stat.key];
        }
      });
      
      // Update nav stats if needed
      if (stats.pendingJobs !== undefined) {
        navStats.value.pending_jobs = stats.pendingJobs;
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load dashboard statistics',
      position: 'top',
      timeout: 3000
    });
  }
};

const actionItems = ref([
  { icon: 'person_add', title: '5 New Applicants', subtitle: 'For Senior Frontend Developer', to: '/candidates?jobId=1' },
  { icon: 'mark_email_unread', title: '3 Unread Messages', subtitle: 'From Priya, Vikram, and more', to: '/employer-messages' },
  { icon: 'pending', title: '2 Jobs Pending Review', subtitle: 'Awaiting admin approval', to: '/posted-jobs' },
  { icon: 'quiz', title: 'Add Screening Test', subtitle: 'Improve filtering by adding a test to your posted jobs', to: '/screening-test' },
]);

const upcomingInterviews = ref([
  { id: 1, candidateName: 'Priya Patel', jobTitle: 'UI/UX Designer', date: 'Aug 4, 2025', time: '11:00 AM' },
  { id: 2, candidateName: 'Rohan Mehta', jobTitle: 'UI/UX Designer', date: 'Aug 4, 2025', time: '02:30 PM' },
  { id: 3, candidateName: 'Sneha Verma', jobTitle: 'Senior Frontend Developer', date: 'Aug 5, 2025', time: '10:00 AM' },
]);

const chartSeries = ref([{ name: 'New Applications', data: [8, 12, 5, 15, 9, 22, 18] }]);
const chartOptions = computed(() => ({
  chart: { type: 'bar', height: 350, toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '60%' } },
  dataLabels: { enabled: false },
  xaxis: { categories: ['Jul 26', 'Jul 27', 'Jul 28', 'Jul 29', 'Jul 30', 'Jul 31', 'Aug 01'] },
  colors: ['#1565c0'], // Main blue theme color
  theme: { mode: $q.dark.isActive ? 'dark' : 'light' }
}));

const employer = ref({
  name: 'Innovate Inc.',
  email: 'hr@innovate.com',
  status: 'pending',
  rejectionReason: ''
});
const selected = ref('Dashboard Overview');
const activeBroadcast = ref(null);
const verificationStatus = ref('');
const rejectionReason = ref('');
const isLoading = ref(true);

const fetchCompanyStatus = async () => {
  try {
    isLoading.value = true;
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    // Get company ID from the employer data
    const companyId = employer.value?.id;
    if (!companyId) {
      console.error('Company ID not found');
      throw new Error('Company ID not found');
    }
    
    const response = await api.get(`/company/${companyId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (response.data) {
      verificationStatus.value = response.data.status || '';
      rejectionReason.value = response.data.rejectionReason || '';
      const storedEmployer = localStorage.getItem('employerData');
      if (storedEmployer) {
        const employerData = JSON.parse(storedEmployer);
        employerData.status = verificationStatus.value;
        employerData.rejectionReason = rejectionReason.value;
        localStorage.setItem('employerData', JSON.stringify(employerData));
        employer.value = employerData;
      }
    }
  } catch (error) {
    console.error('Error fetching company status:', error);
    const storedEmployer = localStorage.getItem('employerData');
    if (storedEmployer) {
      const employerData = JSON.parse(storedEmployer);
      verificationStatus.value = employerData.status || '';
      rejectionReason.value = employerData.rejectionReason || '';
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    // First, load employer data from localStorage
    const storedEmployer = localStorage.getItem('employerData');
    if (storedEmployer) {
      const employerData = JSON.parse(storedEmployer);
      employer.value = {
        ...employerData,
        id: employerData.id || employerData.user_id // Ensure we have the company ID
      };
      verificationStatus.value = employerData.status || '';
      rejectionReason.value = employerData.rejectionReason || '';
      
      // Fetch company status and dashboard stats only if we have a company ID
      if (employer.value.id) {
        await Promise.all([
          fetchCompanyStatus(),
          fetchDashboardStats()
        ]);
      }
    }
    
    // Load any broadcast messages
    const storedBroadcast = localStorage.getItem('jobhubBroadcast');
    if (storedBroadcast) {
      const broadcast = JSON.parse(storedBroadcast);
      if (new Date(broadcast.expiry) > new Date()) {
        activeBroadcast.value = broadcast;
      } else {
        localStorage.removeItem('jobhubBroadcast');
      }
    }
  } catch (error) {
    console.error('Error initializing dashboard:', error);
  }
});

const links = computed(() => [
  { label: 'Dashboard Overview', icon: 'dashboard', to: '/employer-portal' },
  { label: 'Posted Jobs', icon: 'work', to: '/posted-jobs', badge: navStats.value.pending_jobs > 0 ? { value: navStats.value.pending_jobs } : null },
  { label: 'Post New Job', icon: 'add_box', to: '/post-job', highlight: true },
  { label: 'Candidates', icon: 'groups', to: '/candidates' },
  { label: 'Messages', icon: 'mail', to: '/employer-messages' },
  { label: 'Company Profile', icon: 'domain', to: '/company-profile' },
  { label: 'Settings', icon: 'settings', to: '/employer-settings' }
]);

const navigate = (link) => {
  selected.value = link.label;
  if (link.to) router.push(link.to);
};

// MODIFIED: Date is now dynamic and shows the current date.
const todaysDate = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});
</script>

<style scoped>
/* Unchanged styles are kept */
.portal-layout { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.sticky-header { position: sticky; top: 0; z-index: 1000; }
.page-wrapper { flex-grow: 1; display:flex; min-height: 100vh; overflow: hidden; }
.sidebar, .content-area { height: 100%; }
.content-area { flex: 1; overflow-y: auto; }
.page-wrapper { background-color: #F0F7FF; }
.sidebar {
  width: 260px;
  background-color: #1565c0;
  color: #f0f4f8;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: auto;       /* change */
  min-height: 100%;   /* ensures full fill */
}

.sidebar-section { border-bottom: 1px solid #243B55; }
.nav-list .q-item { padding: 12px; border-radius: 8px; margin: 4px 12px; color: #BCCCDC; }
.nav-list .q-item:hover { background-color: #243B55; color: #ffffff; }
.active-link { background-color: #00529b !important; color: #ffffff !important; font-weight: 600; }
.broadcast-banner { background-color: #1D3557 !important; border: 1px solid #457B9D; }
.opacity-8 { opacity: 0.8; }
.interview-card { background-color: #E0F7FA; border-color: #B2EBF2; }
.interview-list .q-item { border-top: 1px solid #B2EBF2; }
.interview-list .q-item:first-child { border-top: none; }
.q-list--separator>.q-item-type+.q-item-type { border-top: 1px solid #EDF2F7; }

/* #################### MODIFIED & NEW STYLES FOR CONTENT AREA #################### */

/* Responsive wrapper for mobile */
@media (max-width: 1023px) {
  .page-wrapper {
    flex-wrap: wrap;
    height: auto;
    overflow-y: auto;
  }
  .content-area {
    width: 100%;
    height: auto;
    overflow-y: visible;
  }
}

.content-title {
  color: #0D1B2A;
}

.subtitle-text {
  color: #5A7184;
}

.list-item-title {
  color: #0D1B2A;
}
.broadcast-banner {
  background-color: #1D3557 !important;
  border: 1px solid #457B9D;
}

.opacity-8 {
  opacity: 0.8;
}
/* Redesigned Stat Cards */
.stat-card {
  background: linear-gradient(145deg, #dfefff, #ffffff);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(29, 135, 255, 0.293) !important;
  transition: all 0.3s ease;
  border: 1px solid #cde3f7;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(29, 135, 255, 0.85) !important;
}

.stat-value {
  color: #0D1B2A;
}

.stat-label {
  color: #5A7184;
}
.interview-card {
  background-color: #E0F7FA;
  border-color: #B2EBF2;
}

.interview-list .q-item {
  border-top: 1px solid #B2EBF2;
}

.interview-list .q-item:first-child {
  border-top: none;
}

.q-list--separator>.q-item-type+.q-item-type {
  border-top: 1px solid #EDF2F7;
}
</style>