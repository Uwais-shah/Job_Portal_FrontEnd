<template>
  <q-page padding class="bg-grey-2">
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="row items-center q-mb-sm">
            <q-btn flat round icon="arrow_back" class="q-mr-sm" @click="$router.push('/admin/dashboard')" />
            <div class="text-h4 text-weight-bold">Reports Management</div>
          </div>
          <div class="text-subtitle1 text-grey-7 q-pl-xl">Manage reported companies and job seekers.</div>
        </div>
      </div>
      <q-separator class="q-my-lg" />

      <!-- Tabs -->
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-7"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="reportedCompanies" icon="business" label="Reported Companies" />
        <q-tab name="reportedJobSeekers" icon="report_problem" label="Reported Job Seekers" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- Reported Companies Tab -->
        <q-tab-panel name="reportedCompanies">
          <div v-if="loadingReportedCompanies" class="row q-col-gutter-lg">
            <div v-for="n in 3" :key="n" class="col-12">
              <q-skeleton type="rect" height="100px" />
            </div>
          </div>
          <div v-else-if="reportedCompanies.length > 0" class="row q-col-gutter-lg">
            <div v-for="company in reportedCompanies" :key="company.id" class="col-12">
              <q-card flat bordered class="reported-company-card">
                <q-card-section class="row items-center">
                  <div class="col-12 col-md-8">
                    <div class="text-h6">{{ company.companyName || 'Unnamed Company' }}</div>
                    <div class="text-subtitle1 text-grey-7">{{ company.email }}</div>
                    <div v-if="company.contactNumber" class="text-subtitle2 text-grey-7">{{ company.contactNumber }}</div>
                    <div class="text-caption q-mt-sm">
                      <q-icon name="report" color="negative" size="sm" />
                      Reported {{ company.reportCount }} {{ company.reportCount === 1 ? 'time' : 'times' }}
                      <span class="q-mx-sm">•</span>
                      <q-icon name="schedule" color="grey-6" size="sm" />
                      Last reported {{ formatRelativeDate(company.lastReportAt) }}
                    </div>
                  </div>
                  <div class="col-12 col-md-4 text-right q-mt-md q-mt-md-none">
                    <q-btn
                      color="negative"
                      icon="pause"
                      label="Suspend Company"
                      @click="confirmSuspend(company)"
                      class="full-width q-mb-sm"
                    />
                    <q-btn
                      color="primary"
                      icon="visibility"
                      label="View Details"
                      @click="viewCompanyDetails(company)"
                      class="full-width"
                      outline
                    />
                    <q-btn
                      color="negative"
                      icon="block"
                      label="Ban Company"
                      @click="confirmBan(company)"
                      class="full-width q-mt-sm"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          <div v-else class="text-center q-pa-xl">
            <q-icon name="check_circle" color="positive" size="64px" class="q-mb-md" />
            <div class="text-h6">No Reported Companies</div>
            <div class="text-grey-7">There are no reported companies at this time.</div>
          </div>
        </q-tab-panel>

        <!-- Reported Job Seekers Tab -->
        <q-tab-panel name="reportedJobSeekers">
          <div v-if="loadingReportedJobSeekers" class="row q-col-gutter-lg">
            <div v-for="n in 3" :key="n" class="col-12">
              <q-skeleton type="rect" height="100px" />
            </div>
          </div>
          <div v-else-if="reportedJobSeekers.length > 0" class="row q-col-gutter-lg">
            <div v-for="user in reportedJobSeekers" :key="user.id" class="col-12">
              <q-card flat bordered class="reported-user-card">
                <q-card-section class="row items-center">
                  <div class="col-12 col-md-8">
                    <div class="text-h6">{{ user.name }}</div>
                    <div class="text-subtitle1 text-grey-7">{{ user.email }}</div>
                    <div class="text-caption q-mt-sm">
                      <q-icon name="report" color="negative" size="sm" />
                      Reported {{ user.reportCount }} {{ user.reportCount === 1 ? 'time' : 'times' }}
                      <span class="q-mx-sm">•</span>
                      <q-icon name="schedule" color="grey-6" size="sm" />
                      Last reported {{ formatRelativeDate(user.lastReportAt) }}
                    </div>
                  </div>
                  <div class="col-12 col-md-4 text-right q-mt-md q-mt-md-none">
                    <q-btn
                      color="negative"
                      icon="pause"
                      label="Suspend Account"
                      @click="suspendReportedUser(user)"
                      class="full-width"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          <div v-else class="text-center q-pa-xl">
            <q-icon name="check_circle" color="positive" size="64px" class="q-mb-md" />
            <div class="text-h6">No Reported Job Seekers</div>
            <div class="text-grey-7">There are no reported job seekers at this time.</div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>

  <!-- Ban Company Dialog -->
  <q-dialog v-model="showBanDialog" persistent>
    <q-card style="min-width: 400px; border-radius: 12px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Ban Company</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <p>Provide a reason for banning <span class="text-weight-bold">{{ currentCompany?.companyName || 'this company' }}</span>. This will permanently deactivate their account.</p>
        <q-input
          v-model="banReason"
          label="Reason for ban"
          type="textarea"
          outlined
          autofocus
          :rules="[val => !!val || 'A reason is required to ban a company.']"
        />
      </q-card-section>
      <q-card-actions align="right" class="q-pa-md bg-grey-1">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn
          unelevated
          label="Ban Company"
          color="negative"
          @click="banCompany"
          :disable="!banReason || !currentCompany"
          :loading="banningId === (currentCompany?.id)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Suspend Company Dialog -->
  <q-dialog v-model="showSuspendDialog" persistent>
    <q-card style="min-width: 400px; border-radius: 12px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ currentCompany?.status === 'suspended' ? 'Reinstate' : 'Suspend' }} Company</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <p v-if="currentCompany?.status === 'suspended'">
          Are you sure you want to reinstate <span class="text-weight-bold">{{ currentCompany?.companyName }}</span>?
          They will regain full access to their account.
        </p>
        <template v-else>
          <p>Provide a reason for suspending <span class="text-weight-bold">{{ currentCompany?.companyName }}</span>.</p>
          <q-input
            v-model="suspendReason"
            type="textarea"
            outlined
            label="Suspension Reason"
            :rules="[val => !!val || 'Please provide a reason']"
            class="q-mt-md"
            autogrow
            hint="The company will be moved to suspended status."
          />
        </template>
      </q-card-section>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat label="Cancel" color="grey-7" v-close-popup />
        <q-btn
          :label="currentCompany?.status === 'suspended' ? 'Reinstate' : 'Suspend'"
          :color="currentCompany?.status === 'suspended' ? 'positive' : 'warning'"
          :loading="suspendingId === currentCompany?.id"
          :disable="!suspendReason && currentCompany?.status !== 'suspended'"
          @click="suspendCompany"
          unelevated
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

const $q = useQuasar();
const activeTab = ref('reportedCompanies');
const loadingReportedCompanies = ref(false);
const loadingReportedJobSeekers = ref(false);
const reportedCompanies = ref([]);
const reportedJobSeekers = ref([]);

// Format date as relative time (e.g., "2 days ago")
const formatRelativeDate = (dateString) => {
  if (!dateString) return 'N/A';

  const now = new Date();
  const reportDate = new Date(dateString);
  const diffInSeconds = Math.floor((now - reportDate) / 1000);

  // Convert to minutes, hours, days, etc.
  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  if (months > 0) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

  return 'just now';
};

// Fetch reported companies
const fetchReportedCompanies = async () => {
  loadingReportedCompanies.value = true;
  try {
    const response = await api.get('/admin/companies/reports');
    reportedCompanies.value = response.data.data || [];
  } catch (error) {
    console.error('Error fetching reported companies:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load reported companies. Please try again.'
    });
  } finally {
    loadingReportedCompanies.value = false;
  }
};

// Fetch reported job seekers
const fetchReportedJobSeekers = async () => {
  loadingReportedJobSeekers.value = true;
  try {
    const response = await api.get('/admin/job_seekers/reports');
    reportedJobSeekers.value = response.data.data || [];
  } catch (error) {
    console.error('Error fetching reported job seekers:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load reported job seekers. Please try again.'
    });
  } finally {
    loadingReportedJobSeekers.value = false;
  }
};

// Watch for tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'reportedCompanies' && reportedCompanies.value.length === 0) {
    fetchReportedCompanies();
  } else if (newTab === 'reportedJobSeekers' && reportedJobSeekers.value.length === 0) {
    fetchReportedJobSeekers();
  }
});

// Dialog states
const showBanDialog = ref(false);
const showSuspendDialog = ref(false);
const currentCompany = ref(null);
const banReason = ref('');
const suspendReason = ref('');
const banningId = ref(null);
const suspendingId = ref(null);

// View company details
const viewCompanyDetails = (company) => {
  currentCompany.value = company;
  $q.dialog({
    title: 'Company Details',
    message: `
      <div class="q-gutter-y-sm">
        <div><strong>Company Name:</strong> ${company.companyName || 'N/A'}</div>
        <div><strong>Email:</strong> ${company.email || 'N/A'}</div>
        <div><strong>Contact:</strong> ${company.contactNumber || 'N/A'}</div>
        <div><strong>Status:</strong>
          <q-badge :color="company.status === 'suspended' ? 'warning' : company.status === 'banned' ? 'negative' : 'positive'" class="q-ml-sm">
            ${company.status === 'suspended' ? 'Suspended' : company.status === 'banned' ? 'Banned' : 'Active'}
          </q-badge>
        </div>
        <div><strong>Report Count:</strong> ${company.reportCount || 0}</div>
        <div><strong>Last Reported:</strong> ${formatRelativeDate(company.lastReportAt)}</div>
        ${
          company.suspensionReason
            ? `<div class="q-mt-sm"><strong>Suspension Reason:</strong><div class="text-caption q-mt-xs bg-warning-1 q-pa-sm rounded-borders">${company.suspensionReason}</div></div>`
            : ''
        }
        ${
          company.banReason
            ? `<div class="q-mt-sm"><strong>Ban Reason:</strong><div class="text-caption q-mt-xs bg-negative-1 q-pa-sm rounded-borders">${company.banReason}</div></div>`
            : ''
        }
      </div>
    `,
    html: true,
    persistent: true,
    ok: {
      label: 'Close',
      color: 'primary'
    },
    style: 'min-width: 400px;'
  });
};

// Confirm suspend company
const confirmSuspend = (company) => {
  currentCompany.value = company;
  suspendReason.value = company.suspensionReason || '';
  showSuspendDialog.value = true;
};

// Suspend company
const suspendCompany = async () => {
  const company = currentCompany.value;
  if (!company) return;

  const companyId = company.id;
  if (!companyId) {
    $q.notify({ type: 'negative', message: 'Invalid company ID' });
    return;
  }

  suspendingId.value = companyId;
  const isReinstating = company.status === 'suspended';

  try {
    let result;
    const endpoint = isReinstating
      ? `/admin/companies/${companyId}/reinstate`
      : `/admin/companies/${companyId}/suspend`;

    const data = isReinstating ? {} : { reason: suspendReason.value };

    const response = await api({
      method: isReinstating ? 'PUT' : 'POST',
      url: endpoint,
      data
    });

    result = response.data;

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: isReinstating
          ? `${company.companyName} has been reinstated.`
          : `${company.companyName} has been suspended.`
      });

      // Update the company in the list
      const index = reportedCompanies.value.findIndex(c => c.id === companyId);
      if (index !== -1) {
        if (isReinstating) {
          reportedCompanies.value[index].status = 'active';
          reportedCompanies.value[index].suspensionReason = null;
        } else {
          reportedCompanies.value[index].status = 'suspended';
          reportedCompanies.value[index].suspensionReason = suspendReason.value;
        }
      }

      showSuspendDialog.value = false;
      suspendReason.value = '';
    } else {
      throw new Error(result.error || 'Failed to update company status');
    }
  } catch (error) {
    console.error('Error in suspendCompany:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to update company status. Please try again.'
    });
  } finally {
    suspendingId.value = null;
  }
};

// Confirm ban company
const confirmBan = (company) => {
  currentCompany.value = company;
  banReason.value = company.banReason || '';
  showBanDialog.value = true;
};

// Ban company
const banCompany = async () => {
  const company = currentCompany.value;
  if (!company) return;

  const companyId = company.id;
  if (!companyId) {
    $q.notify({ type: 'negative', message: 'Invalid company ID' });
    return;
  }

  if (!banReason.value) {
    $q.notify({ type: 'warning', message: 'Please provide a reason for banning' });
    return;
  }

  banningId.value = companyId;

  try {
    const response = await api.post(`/admin/companies/${companyId}/ban`, {
      reason: banReason.value
    });

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: `${company.companyName} has been banned.`
      });

      // Update the company in the list
      const index = reportedCompanies.value.findIndex(c => c.id === companyId);
      if (index !== -1) {
        reportedCompanies.value[index].status = 'banned';
        reportedCompanies.value[index].banReason = banReason.value;
      }

      showBanDialog.value = false;
      banReason.value = '';
    } else {
      throw new Error(response.data.error || 'Failed to ban company');
    }
  } catch (error) {
    console.error('Error in banCompany:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to ban company. Please try again.'
    });
  } finally {
    banningId.value = null;
  }
};

// Update the suspendReportedUser function to match the same pattern
const suspendReportedUser = (user) => {
  $q.dialog({
    title: 'Confirm Suspension',
    message: `Are you sure you want to ${user.status === 'suspended' ? 'reinstate' : 'suspend'} ${user.name || 'this user'}?`,
    cancel: {
      label: 'Cancel',
      color: 'grey',
      flat: true
    },
    persistent: true,
    ok: {
      label: user.status === 'suspended' ? 'Reinstate' : 'Suspend',
      color: user.status === 'suspended' ? 'positive' : 'negative',
      flat: true
    }
  }).onOk(async () => {
    try {
      const endpoint = user.status === 'suspended'
        ? `/admin/users/${user.id}/reinstate`
        : `/admin/users/${user.id}/suspend`;

      const method = user.status === 'suspended' ? 'PUT' : 'POST';

      const response = await api({
        method,
        url: endpoint,
        data: { reason: 'Reported by admin' }
      });

      if (response.data.success) {
        // Update the user in the list
        const index = reportedJobSeekers.value.findIndex(u => u.id === user.id);
        if (index !== -1) {
          reportedJobSeekers.value[index].status = user.status === 'suspended' ? 'active' : 'suspended';
        }

        $q.notify({
          type: 'positive',
          message: `User has been ${user.status === 'suspended' ? 'reinstated' : 'suspended'} successfully.`
        });
      } else {
        throw new Error(response.data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to suspend user. Please try again.'
      });
    }
  });
};

// Initial data load
onMounted(() => {
  fetchReportedCompanies();
});
</script>

<style scoped>
.reported-company-card {
  border-left: 4px solid #ff9800;
  transition: transform 0.2s;
}

.reported-company-card:hover {
  transform: translateY(-2px);
}

.reported-user-card {
  border-left: 4px solid #f44336;
  transition: transform 0.2s;
}

.reported-user-card:hover {
  transform: translateY(-2px);
}
</style>
