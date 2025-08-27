<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h4 text-weight-bold">Dashboard Overview</div>
          <div class="text-subtitle1 text-grey-7">Here's the latest platform activity for {{ todaysDate }}.</div>
        </div>
        <q-btn 
          color="primary" 
          icon="refresh" 
          label="Refresh" 
          @click="fetchStats" 
          :loading="loading" 
          flat 
          round
        >
          <q-tooltip>Refresh dashboard data</q-tooltip>
        </q-btn>
      </div>
      <q-separator class="q-my-lg" />

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-pa-lg">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md">Loading dashboard data...</div>
      </div>

      <!-- Stats Cards -->
      <div v-else class="row q-col-gutter-lg q-mb-lg">
        <!-- Total Users Card -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="stat-card">
            <q-card-section class="row items-center no-wrap">
              <q-icon name="group" size="36px" color="blue-6" class="q-mr-sm" />
              <div>
                <div class="text-caption text-grey-8">Total Users</div>
                <div class="text-h5 text-weight-bolder">{{ stats.totalUsers || 0 }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Job Seekers Card -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="stat-card">
            <q-card-section class="row items-center no-wrap">
              <q-icon name="work" size="36px" color="indigo-6" class="q-mr-sm" />
              <div>
                <div class="text-caption text-grey-8">Job Seekers</div>
                <div class="text-h5 text-weight-bolder">{{ stats.jobSeekers || 0 }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Companies Card -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="stat-card">
            <q-card-section class="row items-center no-wrap">
              <q-icon name="business" size="36px" color="purple-6" class="q-mr-sm" />
              <div>
                <div class="text-caption text-grey-8">Companies</div>
                <div class="text-h5 text-weight-bolder">{{ stats.totalCompanies || 0 }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Pending Approvals Card -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card 
            flat 
            bordered 
            class="stat-card cursor-pointer"
            @click="pendingApprovals > 0 && $router.push('/admin/companies')"
            :class="{'hover-card': pendingApprovals > 0}"
          >
            <q-card-section class="row items-center no-wrap">
              <q-icon 
                name="pending_actions" 
                size="36px" 
                :color="pendingApprovals > 0 ? 'orange-6' : 'grey-6'" 
                class="q-mr-sm" 
              />
              <div>
                <div class="text-caption text-grey-8">Pending Approvals</div>
                <div class="text-h5 text-weight-bolder">{{ pendingApprovals || 0 }}</div>
              </div>
              <q-icon 
                v-if="pendingApprovals > 0" 
                name="chevron_right" 
                color="grey-6" 
                size="20px"
                class="q-ml-xs"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Active Job Listings -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="stat-card">
            <q-card-section class="row items-center no-wrap">
              <q-icon name="assignment" size="36px" color="green-6" class="q-mr-sm" />
              <div>
                <div class="text-caption text-grey-8">Active Job Listings</div>
                <div class="text-h5 text-weight-bolder">{{ stats.activeJobListings || 0 }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Rejected Companies -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="stat-card">
            <q-card-section class="row items-center no-wrap">
              <q-icon name="block" size="36px" color="red-6" class="q-mr-sm" />
              <div>
                <div class="text-caption text-grey-8">Rejected Companies</div>
                <div class="text-h5 text-weight-bolder">{{ stats.totalRejectedCompanies || 0 }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

    </div>

    <q-dialog v-model="rejectDialog.show" persistent>
      <q-card style="min-width: 400px; border-radius: 12px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Reject Job Posting</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <p>Please provide a clear reason for rejecting this job posting. This will be sent to the employer.</p>
          <q-input
            v-model="rejectDialog.reason"
            type="textarea"
            outlined
            autofocus
            :rules="[val => !!val || 'Reason is required']"
            label="Reason for rejection"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-8" v-close-popup />
          <q-btn
            unelevated
            label="Submit Rejection"
            color="negative"
            @click="rejectJob"
            :disable="!rejectDialog.reason"
            :loading="rejectingJobId === rejectDialog.jobId"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { date } from 'quasar';
import { useQuasar } from 'quasar';
import adminService from 'src/services/admin.service';

export default {
  name: 'AdminDashboard',

  setup() {
    const $q = useQuasar();
    const router = useRouter();

    const stats = ref({
      totalUsers: 0,
      jobSeekers: 0,
      totalCompanies: 0,
      pendingApprovals: 0
    });

    const loading = ref(true);
    const loadingPendingJobs = ref(false);
    const pendingJobs = ref([]);
    const approvingJobId = ref(null);
    const rejectingJobId = ref(null);
    const pendingApprovals = ref(0);

    const todaysDate = ref(date.formatDate(Date.now(), 'MMMM D, YYYY'));
    
    // Fetch dashboard data when component is mounted
    onMounted(() => {
      fetchStats();
    });

    const rejectDialog = ref({
      show: false,
      jobId: null,
      reason: ''
    });

    const formatDate = (dateString) => {
      return date.formatDate(dateString, 'MMM D, YYYY [at] h:mm A');
    };

    const fetchStats = async () => {
      loading.value = true;
      try {
        const [statsResult, companiesResult] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getUnverifiedCompanies()
        ]);

        if (statsResult.success) {
          // Update stats with the response data
          stats.value = {
            ...stats.value,
            ...statsResult.data
          };
          
          // Update pending approvals from the stats
          if (typeof statsResult.data.pendingApprovals !== 'undefined') {
            pendingApprovals.value = statsResult.data.pendingApprovals;
          }
        } else {
          throw new Error(statsResult.error || 'Failed to load dashboard stats');
        }

        // Still fetch unverified companies to keep the existing functionality
        if (companiesResult.success) {
          pendingApprovals.value = companiesResult.data.length;
        }
      } catch (error) {
        console.error('Error in fetchStats:', error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Failed to load dashboard data',
          position: 'top'
        });
      } finally {
        loading.value = false;
      }
    };

    const fetchPendingJobs = async () => {
      loadingPendingJobs.value = true;
      try {
        const result = await adminService.getPendingJobs();
        if (result.success) {
          pendingJobs.value = result.data;
        } else {
          throw new Error(result.error || 'Failed to fetch pending jobs');
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message,
          position: 'top'
        });
      } finally {
        loadingPendingJobs.value = false;
      }
    };

    const approveJob = async (jobId) => {
      approvingJobId.value = jobId;
      try {
        const result = await adminService.approveJob(jobId);
        if (result.success) {
          $q.notify({
            type: 'positive',
            message: 'Job approved successfully',
            position: 'top'
          });
          await Promise.all([fetchPendingJobs(), fetchStats()]);
        } else {
          throw new Error(result.error || 'Failed to approve job');
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message,
          position: 'top'
        });
      } finally {
        approvingJobId.value = null;
      }
    };

    const showRejectDialog = (job) => {
      rejectDialog.value = {
        show: true,
        jobId: job.id,
        reason: ''
      };
    };

    const rejectJob = async () => {
      if (!rejectDialog.value.reason) return;

      rejectingJobId.value = rejectDialog.value.jobId;
      try {
        const result = await adminService.rejectJob(
          rejectDialog.value.jobId,
          rejectDialog.value.reason
        );

        if (result.success) {
          $q.notify({
            type: 'positive',
            message: 'Job rejected successfully',
            position: 'top'
          });
          rejectDialog.value.show = false;
          await Promise.all([fetchPendingJobs(), fetchStats()]);
        } else {
          throw new Error(result.error || 'Failed to reject job');
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message,
          position: 'top'
        });
      } finally {
        rejectingJobId.value = null;
      }
    };

    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
      }
    };

    onMounted(async () => {
      checkAuth();
      await Promise.all([fetchStats(), fetchPendingJobs()]);
    });

    return {
      stats,
      loading,
      loadingPendingJobs,
      pendingJobs,
      approvingJobId,
      rejectingJobId,
      rejectDialog,
      pendingApprovals,
      todaysDate,
      formatDate,
      fetchPendingJobs,
      approveJob,
      showRejectDialog,
      rejectJob,
    };
  }
};
</script>

<style scoped>
/* Hover effect for clickable cards */
.hover-card {
  transition: all 0.2s ease-in-out;
  border-left: 4px solid transparent;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #ff9800;
  cursor: pointer;
}

.stat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.stat-card .q-card__section {
  flex: 1;
}

.admin-active-link {
  background-color: #e3f2fd; /* A light blue */
  color: #1976d2; /* Primary color */
  font-weight: 500;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.job-expansion-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 8px;
}

.q-expansion-item--expanded {
  background: #fafafa;
}
</style>