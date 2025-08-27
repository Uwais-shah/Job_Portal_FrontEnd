<template>
  <q-page padding class="bg-grey-2">
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="row items-center q-mb-sm">
            <q-btn flat round icon="arrow_back" class="q-mr-sm" @click="$router.push('/admin/dashboard')" />
            <div class="text-h4 text-weight-bold">Companies Management</div>
          </div>
          <div class="text-subtitle1 text-grey-7 q-pl-xl">Approve, reject, and manage all company accounts.</div>
        </div>
        <div class="col-auto">
          <q-btn unelevated color="primary" icon="refresh" label="Refresh" @click="fetchCompanies" :loading="refreshing" />
        </div>
      </div>
      <q-separator class="q-my-lg" />

      <q-card flat bordered>
        <q-inner-loading :showing="loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

        <div v-if="!loading">
          <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
            <q-tab name="unverified" label="Pending Verification">
              <q-badge v-if="unverifiedCompanies.length" color="orange" floating>{{ unverifiedCompanies.length }}</q-badge>
            </q-tab>
            <q-tab name="verified" label="Verified Companies" />
            <q-tab name="rejected" label="Rejected Companies" />
          </q-tabs>
          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="unverified">
              <div v-if="unverifiedCompanies.length === 0" class="text-center q-pa-xl">
                <q-icon name="check_circle_outline" color="positive" size="64px" class="q-mb-md" />
                <div class="text-h6">No companies are pending verification.</div>
                <div class="text-grey-7">You're all caught up!</div>
              </div>
              <q-list v-else separator>
                <q-expansion-item
                  v-for="company in unverifiedCompanies"
                  :key="company.user_id"
                  group="pending-companies"
                  header-class="q-pa-md"
                >
                  <template v-slot:header>
                    <q-item-section avatar>
                      <q-avatar color="orange-1" text-color="orange-8" icon="pending_actions" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-body1 text-weight-medium">{{ company.company_name || 'Unnamed Company' }}</q-item-label>
                      <q-item-label caption><q-icon name="email" size="xs" class="q-mr-xs"/>{{ company.user?.email || 'No email' }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-caption text-grey-7">
                        Registered: {{ formatDate(company.createdAt) }}
                      </div>
                    </q-item-section>
                  </template>

                  <q-card>
                    <q-card-section class="bg-grey-1">
                      <div class="text-subtitle2 text-grey-8 q-mb-sm">COMPANY DETAILS</div>
                      <div class="row q-col-gutter-x-lg q-col-gutter-y-md">
                        <div class="col-12 col-md-6">
                          <q-list dense>
                            <q-item><q-item-section avatar><q-icon color="grey-7" name="phone"/></q-item-section><q-item-section>{{ company.contact_number || 'Not provided' }}</q-item-section></q-item>
                            <q-item><q-item-section avatar><q-icon color="grey-7" name="location_on"/></q-item-section><q-item-section>{{ company.location || 'Not provided' }}</q-item-section></q-item>
                          </q-list>
                        </div>
                        <div class="col-12 col-md-6">
                          <q-list dense>
                            <q-item v-if="company.website"><q-item-section avatar><q-icon color="grey-7" name="public"/></q-item-section><q-item-section><a :href="company.website" target="_blank" class="text-primary">{{ company.website }}</a></q-item-section></q-item>
                            <q-item v-if="company.linkedinUrl"><q-item-section avatar><q-icon color="grey-7" name="mdi-linkedin"/></q-item-section><q-item-section><a :href="company.linkedinUrl" target="_blank" class="text-primary">View LinkedIn Profile</a></q-item-section></q-item>
                          </q-list>
                        </div>
                        <div v-if="company.description" class="col-12">
                          <div class="text-caption text-grey-7 q-mt-sm">DESCRIPTION</div>
                          <p class="text-body2 q-mt-xs">{{ company.description }}</p>
                        </div>
                      </div>
                      <q-separator spaced/>
                      <div class="row justify-end q-gutter-sm q-mt-md">
                        <q-btn
                          outline
                          color="negative"
                          icon="cancel"
                          label="Reject"
                          @click="confirmReject(company)"
                          :loading="rejectingId === company.user_id"
                          :disable="approvingId === company.user_id"
                        />
                        <q-btn
                          unelevated
                          color="positive"
                          icon="check_circle"
                          label="Approve"
                          @click="approveCompany(company)"
                          :loading="approvingId === company.user_id"
                          :disable="rejectingId === company.user_id"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </q-list>
            </q-tab-panel>

            <q-tab-panel name="verified">
              <div v-if="verifiedCompanies.length === 0" class="text-center q-pa-xl">
                <q-icon name="domain_disabled" color="grey-5" size="64px" class="q-mb-md" />
                <div class="text-h6">No verified companies found.</div>
                <div class="text-grey-7">Approved companies will appear here.</div>
              </div>
              <q-list v-else separator>
                <q-expansion-item
                  v-for="company in verifiedCompanies"
                  :key="company.user_id"
                  group="verified-companies"
                  header-class="q-pa-md"
                  class="q-mb-sm"
                >
                  <template v-slot:header>
                    <q-item-section avatar>
                      <q-avatar :color="company.status === 'suspended' ? 'warning' : 'positive'" text-color="white" :icon="company.status === 'suspended' ? 'pause_circle_filled' : 'verified_user'" />
                    </q-item-section>
                    <q-item-section>
                      <div class="row items-center">
                        <q-item-label class="text-body1 text-weight-medium">{{ company.company_name || 'Unnamed Company' }}</q-item-label>
                        <q-badge v-if="company.industry" color="primary" class="q-ml-sm">{{ company.industry }}</q-badge>
                      </div>
                      <q-item-label caption>
                        <q-icon name="email" size="xs" class="q-mr-xs"/>{{ company.user?.email || 'No email' }}
                        <q-icon v-if="company.contact_number" name="phone" size="xs" class="q-ml-sm q-mr-xs"/>{{ company.contact_number }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side top>
                      <div class="text-caption text-grey-7">
                        <div>Verified: {{ formatDate(company.verified_at) }}</div>
                        <div v-if="company.verified_by">By: {{ company.verified_by_name || 'Admin' }}</div>
                      </div>
                    </q-item-section>
                  </template>

                  <q-card>
                    <q-card-section class="bg-grey-1">
                      <div class="row q-col-gutter-lg">
                        <div class="col-12 col-md-6">
                          <div class="text-subtitle2 text-grey-8 q-mb-sm">COMPANY DETAILS</div>
                          <q-list dense>
                            <q-item v-if="company.website">
                              <q-item-section avatar><q-icon color="grey-7" name="public"/></q-item-section>
                              <q-item-section>
                                <a :href="company.website.startsWith('http') ? company.website : 'https://' + company.website" 
                                   target="_blank" 
                                   class="text-primary">
                                  {{ company.website }}
                                </a>
                              </q-item-section>
                            </q-item>
                            <q-item v-if="company.linkedin_url">
                              <q-item-section avatar><q-icon color="grey-7" name="mdi-linkedin"/></q-item-section>
                              <q-item-section>
                                <a :href="company.linkedin_url" target="_blank" class="text-primary">View LinkedIn Profile</a>
                              </q-item-section>
                            </q-item>
                            <q-item v-if="company.number_of_employees">
                              <q-item-section avatar><q-icon color="grey-7" name="people"/></q-item-section>
                              <q-item-section>{{ company.number_of_employees }} employees</q-item-section>
                            </q-item>
                            <q-item v-if="company.positions_available">
                              <q-item-section avatar><q-icon color="grey-7" name="work"/></q-item-section>
                              <q-item-section>{{ company.positions_available }} open positions</q-item-section>
                            </q-item>
                          </q-list>
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="text-subtitle2 text-grey-8 q-mb-sm">LOCATION</div>
                          <q-list dense>
                            <q-item>
                              <q-item-section avatar><q-icon color="grey-7" name="location_on"/></q-item-section>
                              <q-item-section>{{ company.location || 'Not specified' }}</q-item-section>
                            </q-item>
                            <q-item v-if="company.hq_location">
                              <q-item-section avatar><q-icon color="grey-7" name="corporate_fare"/></q-item-section>
                              <q-item-section>HQ: {{ company.hq_location }}</q-item-section>
                            </q-item>
                          </q-list>
                        </div>
                      </div>
                      
                      <div v-if="company.description" class="q-mt-md">
                        <div class="text-subtitle2 text-grey-8 q-mb-sm">ABOUT</div>
                        <p class="text-body2 q-mt-xs q-mb-none">{{ company.description }}</p>
                      </div>
                      
                      <q-separator class="q-my-md" />
                      
                      <div class="row justify-between items-center">
                        <div class="text-caption text-grey-7">
                          <div>Last updated: {{ formatDate(company.updatedAt) }}</div>
                          <div v-if="company.rejection_reason" class="text-negative">
                            <q-icon name="warning" size="xs" class="q-mr-xs"/>
                            Previous suspension reason: {{ company.rejection_reason }}
                          </div>
                        </div>
                        <div class="q-gutter-sm">
                          <q-btn
                            flat
                            color="negative"
                            icon="block"
                            label="Ban Company"
                            @click="confirmBan(company)"
                            :loading="banningId === (company.user_id || company.id)"
                            :disable="suspendingId === (company.user_id || company.id)"
                            dense
                          />
                          <q-btn
                            outline
                            color="warning"
                            :icon="company.status === 'suspended' ? 'play_circle_outline' : 'pause_circle_outline'"
                            :label="company.status === 'suspended' ? 'Reinstate' : 'Suspend'"
                            @click="confirmSuspend(company)"
                            :loading="suspendingId === company.user_id"
                            :disable="banningId === company.user_id"
                            class="q-ml-sm"
                            dense
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </q-list>
            </q-tab-panel>

            <q-tab-panel name="rejected">
              <div class="text-center q-pa-xl">
                <q-icon name="block" color="grey-5" size="64px" class="q-mb-md" />
                <div class="text-h6">Rejected Companies List</div>
                <div class="text-grey-7">This feature is under construction.</div>
              </div>
            </q-tab-panel>

          </q-tab-panels>
        </div>
      </q-card>
    </div>

    <q-dialog v-model="showRejectDialog" persistent>
      <q-card style="min-width: 400px; border-radius: 12px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Ban Company</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <p>Provide a reason for banning <span class="text-weight-bold">{{ currentCompany.company_name }}</span>. This will permanently deactivate their account.</p>
          <q-input
            v-model="rejectReason"
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
            :disable="!rejectReason || !currentCompany"
            :loading="banningId === (currentCompany?.user_id || currentCompany?.id)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showSuspendDialog" persistent>
      <q-card style="min-width: 400px; border-radius: 12px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Suspend Company</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="text-body1 q-mb-md">
            Are you sure you want to suspend <strong>{{ currentCompany.company_name }}</strong>? 
            The company will be moved back to pending status and will need to be reviewed again.
          </div>
          <q-input
            v-model="suspendReason"
            type="textarea"
            label="Reason for suspension"
            :rules="[val => !!val || 'Please provide a reason']"
            autogrow
            outlined
            dense
            class="q-mb-md"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            flat
            label="Suspend Company"
            color="warning"
            :loading="suspendingId === currentCompany.user_id"
            :disable="!suspendReason"
            @click="suspendCompany"
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
            Are you sure you want to reinstate <span class="text-weight-bold">{{ currentCompany?.company_name }}</span>? 
            They will regain full access to their account.
          </p>
          <template v-else>
            <p>Provide a reason for suspending <span class="text-weight-bold">{{ currentCompany?.company_name }}</span>. This will move them back to pending status.</p>
            <q-input
              v-model="suspendReason"
              type="textarea"
              outlined
              label="Suspension Reason"
              :rules="[val => !!val || 'Please provide a reason']"
              class="q-mt-md"
              autogrow
              :hint="'This company will be moved to pending status and will need to be re-approved.'"
            />
          </template>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            :label="currentCompany?.status === 'suspended' ? 'Reinstate' : 'Suspend'"
            :color="currentCompany?.status === 'suspended' ? 'positive' : 'warning'"
            :loading="suspendingId === currentCompany?.user_id"
            :disable="!suspendReason && currentCompany?.status !== 'suspended'"
            @click="suspendCompany"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import adminService from 'src/services/admin.service';

export default {
  name: 'CompaniesManagement',

  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const refreshing = ref(false);
    const tab = ref('unverified');
    const unverifiedCompanies = ref([]);
    const verifiedCompanies = ref([]);
    const showRejectDialog = ref(false);
    const showSuspendDialog = ref(false);
    const currentCompany = ref(null);
    const rejectReason = ref('');
    const suspendReason = ref('');
    const approvingId = ref(null);
    const rejectingId = ref(null);
    const suspendingId = ref(null);
    const banningId = ref(null);
    
    // You are missing the setup for the drawer and logout here. 
    // This is correct, as they belong in AdminLayout.vue, not here.

    const fetchCompanies = async () => {
      if(loading.value) refreshing.value = false;
      else refreshing.value = true;

      try {
        const unverifiedRes = await adminService.getUnverifiedCompanies();
        unverifiedCompanies.value = unverifiedRes.data || [];

        const verifiedRes = await adminService.getVerifiedCompanies();
        verifiedCompanies.value = verifiedRes.data || [];

      } catch (error) {
        console.error('Error fetching companies:', error);
        $q.notify({
          type: 'negative',
          message: 'Failed to load companies. Please try again.'
        });
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return date.formatDate(dateString, 'MMM D, YYYY');
    };

    const approveCompany = async (company) => {
      if (!company) return;
      const companyId = company.user_id || company.id; // Handle both formats
      if (!companyId) {
        $q.notify({ type: 'negative', message: 'Invalid company ID' });
        return;
      }
      
      approvingId.value = companyId;
      try {
        console.log('Approving company with ID:', companyId);
        const result = await adminService.approveCompany(companyId);
        if (result.success) {
          $q.notify({
            type: 'positive',
            message: `${company.company_name} has been approved.`,
            icon: 'check_circle'
          });
          // Optimistic UI update
          const index = unverifiedCompanies.value.findIndex(c => (c.user_id || c.id) === companyId);
          if (index !== -1) {
            const [approvedCompany] = unverifiedCompanies.value.splice(index, 1);
            approvedCompany.verified_at = new Date().toISOString();
            verifiedCompanies.value.unshift(approvedCompany);
          }
        } else {
          throw new Error(result.error || 'Failed to approve company');
        }
      } catch (error) {
        console.error('Error in approveCompany:', error);
        $q.notify({ 
          type: 'negative', 
          message: error.message || 'Failed to approve company. Please try again.' 
        });
      } finally {
        approvingId.value = null;
      }
    };

    const confirmReject = (company) => {
      currentCompany.value = company;
      rejectReason.value = '';
      showRejectDialog.value = true;
    };

    const confirmSuspend = (company) => {
      currentCompany.value = company;
      suspendReason.value = company.rejection_reason || '';
      showSuspendDialog.value = true;
    };

    const confirmBan = (company) => {
      currentCompany.value = company;
      rejectReason.value = company.rejection_reason || '';
      showRejectDialog.value = true;
    };

    const suspendCompany = async () => {
      const company = currentCompany.value;
      if (!company) return;
      
      const companyId = company.user_id || company.id;
      if (!companyId) {
        $q.notify({ type: 'negative', message: 'Invalid company ID' });
        return;
      }

      suspendingId.value = companyId;
      const isReinstating = company.status === 'suspended';

      try {
        let result;
        if (isReinstating) {
          // Reinstating the company (approve it again)
          result = await adminService.approveCompany(companyId);
        } else {
          // Suspending the company (move to pending)
          result = await adminService.suspendCompany(companyId, suspendReason.value);
        }

        if (result.success) {
          $q.notify({
            type: 'positive',
            message: isReinstating 
              ? `${company.company_name} has been reinstated.`
              : `${company.company_name} has been suspended and moved to pending.`,
            icon: isReinstating ? 'check_circle' : 'pause_circle_filled'
          });

          // Update the company in the appropriate list
          const verifiedIndex = verifiedCompanies.value.findIndex(c => (c.user_id || c.id) === companyId);
          if (verifiedIndex !== -1) {
            if (isReinstating) {
              // Update status to approved
              verifiedCompanies.value[verifiedIndex].status = 'approved';
              verifiedCompanies.value[verifiedIndex].rejection_reason = null;
            } else {
              // Move to unverified list
              const [suspendedCompany] = verifiedCompanies.value.splice(verifiedIndex, 1);
              suspendedCompany.status = 'pending';
              suspendedCompany.rejection_reason = suspendReason.value;
              unverifiedCompanies.value.unshift(suspendedCompany);
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
          message: error.message || 'Failed to update company status. Please try again.'
        });
      } finally {
        suspendingId.value = null;
      }
    };

    const banCompany = async () => {
      const company = currentCompany.value;
      if (!company) return;
      
      const companyId = company.user_id || company.id;
      if (!companyId) {
        $q.notify({ type: 'negative', message: 'Invalid company ID' });
        return;
      }

      if (!rejectReason.value) {
        $q.notify({ type: 'warning', message: 'Please provide a reason for banning' });
        return;
      }

      banningId.value = companyId;

      try {
        // Use reject endpoint for banning
        const result = await adminService.rejectCompany(companyId, rejectReason.value);
        if (result.success) {
          $q.notify({
            type: 'negative',
            message: `${company.company_name} has been banned.`,
            icon: 'block'
          });
          // Remove from verified companies list
          verifiedCompanies.value = verifiedCompanies.value.filter(c => (c.user_id || c.id) !== companyId);
          showRejectDialog.value = false;
          rejectReason.value = '';
          currentCompany.value = null;
        } else {
          throw new Error(result.error || 'Failed to ban company');
        }
      } catch (error) {
        console.error('Error in banCompany:', error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Failed to ban company. Please try again.'
        });
      } finally {
        banningId.value = null;
      }
    };

    const rejectCompany = async () => {
      if (!currentCompany.value || !rejectReason.value) return;
      
      const company = currentCompany.value;
      const companyId = company.user_id || company.id; // Handle both formats
      
      if (!companyId) {
        $q.notify({ type: 'negative', message: 'Invalid company ID' });
        return;
      }
      
      rejectingId.value = companyId;
      
      try {
        console.log('Rejecting company with ID:', companyId, 'Reason:', rejectReason.value);
        const result = await adminService.rejectCompany(companyId, rejectReason.value);
        
        if (result.success) {
          $q.notify({
            type: 'warning',
            message: `${company.company_name || 'The company'} has been rejected.`,
            icon: 'warning'
          });
          
          // Optimistic UI update - remove from unverified list
          const index = unverifiedCompanies.value.findIndex(c => (c.user_id || c.id) === companyId);
          if (index !== -1) {
            unverifiedCompanies.value.splice(index, 1);
          }
          
          showRejectDialog.value = false;
          rejectReason.value = ''; // Reset the reason field
        } else {
          throw new Error(result.error || 'Failed to reject company');
        }
      } catch (error) {
        console.error('Error in rejectCompany:', error);
        $q.notify({ 
          type: 'negative', 
          message: error.message || 'Failed to reject company. Please try again.' 
        });
      } finally {
        rejectingId.value = null;
      }
    };

    onMounted(() => {
      fetchCompanies();
    });

    return {
      loading,
      refreshing,
      tab,
      unverifiedCompanies,
      verifiedCompanies,
      showRejectDialog,
      showSuspendDialog,
      currentCompany,
      rejectReason,
      suspendReason,
      approvingId,
      rejectingId,
      suspendingId,
      banningId,
      fetchCompanies,
      formatDate,
      approveCompany,
      confirmReject,
      confirmSuspend,
      confirmBan,
      banCompany,
      suspendCompany,
      rejectCompany,
    };
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
  color: var(--q-primary);
}
a:hover {
  text-decoration: underline;
}
</style>