<template>
  <AppHeader class="sticky-header" />
  <div class="page-wrapper row no-wrap">
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
          <q-item v-for="link in links" :key="link.label" :active="selected === link.label" active-class="active-link"
            clickable v-ripple @click="navigate(link)">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              {{ link.label }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <div class="content-area post-job-bg q-pa-md q-pa-lg-xl">
      <div class="step-indicator-container q-mb-xl">
        <div class="text-center q-mb-md">
          <div class="text-overline text-primary">Step {{ step }} of 4</div>
          <div class="text-h5 text-weight-bold step-section-title">{{ stepSections[step - 1] }}</div>
        </div>
        <q-linear-progress :value="step / 4" color="primary" track-color="white" size="8px" rounded />
      </div>

      <q-banner v-if="verificationStatus === 'pending'" class="bg-blue-1 text-blue-9 q-mb-md" rounded>
        <template v-slot:avatar>
          <q-icon name="pending_actions" color="blue-7" size="2em" />
        </template>
        <div class="text-weight-medium">Your company is under review</div>
        <div>You can post jobs, but they will be marked as pending until your company is verified. The verification
          process typically takes 1-2 business days.</div>
      </q-banner>
      <q-banner v-else-if="verificationStatus === 'rejected'" class="bg-red-1 text-red-9 q-mb-md" rounded>
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
      <q-banner v-else-if="verificationStatus === 'approved'" class="bg-green-1 text-green-9 q-mb-md" rounded>
        <template v-slot:avatar>
          <q-icon name="verified" color="green-7" size="2em" />
        </template>
        <div class="text-weight-medium">Your company is verified!</div>
        <div>Your job postings will be published immediately after submission.</div>
      </q-banner>

      <q-card v-if="step === 1" class="step-card">
        <q-card-section class="q-pt-lg">
          <div class="text-h6">Job Details</div>
          <p>Provide the essential details for your job opening.</p>
        </q-card-section>
        <q-form @submit.prevent="nextStep">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-y-lg">
              <div class="row q-col-gutter-x-md q-col-gutter-y-lg">
                <div class="col-12 col-md-6">
                  <q-input v-model="form.title" label="Job Title" filled stack-label required />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="form.location" label="Job Location (e.g., City, 'Remote')" filled stack-label
                    required />
                </div>
                <div class="col-12 col-md-6">
                  <q-select v-model="form.type" label="Job Type"
                    :options="['full_time', 'part_time', 'contract', 'internship', 'remote']" filled stack-label
                    required />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model.number="form.positions" type="number" label="Number of Positions" filled stack-label
                    required />
                </div>
              </div>
            </div>
            <q-separator spaced="xl" />
            <div class="q-gutter-y-lg">
              <div class="row q-col-gutter-x-md q-col-gutter-y-lg">
                <div class="col-12 col-md-6">
                  <q-input v-model="form.salary" label="Salary Range (per annum)" filled stack-label required
                    hint="e.g., ₹8,00,000 - ₹12,00,000" />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="form.timeline" label="Recruitment Timeline" filled stack-label required
                    hint="e.g., 'Immediate', 'Within 2 weeks'" />
                </div>
              </div>
              <q-input v-model="form.benefits" label="Bonus and Benefits (Optional)" filled stack-label />
            </div>
            <q-separator spaced="xl" />
            <div class="row">
              <div class="col-12">
                <q-input v-model="tagInput" label="Job Tags" filled stack-label hint="Type a tag and press Enter or comma"
                  @keyup="onTagKeyup" @blur="addTag">
                  <template v-slot:append>
                    <q-chip v-for="(tag, index) in form.tags" :key="index" removable
                      @remove="form.tags.splice(index, 1)" class="q-mr-xs" color="primary" text-color="white">
                      {{ tag }}
                    </q-chip>
                  </template>
                </q-input>
              </div>
            </div>
            <q-separator spaced="xl" />
            <div>
              <div class="text-subtitle1 q-mb-sm text-weight-medium">Job Description</div>
              <q-editor v-model="form.description" placeholder="Describe the responsibilities, requirements..."
                :min-height="150" :toolbar="[['bold', 'italic', 'underline'], ['unordered', 'ordered']]"
                :rules="descriptionRules">
                <template v-slot:after>
                  <div class="text-caption text-right q-pa-sm"
                    :class="plainDescription.length < 200 ? 'text-negative' : 'text-positive'">{{
                      plainDescription.length }} / 200+ characters</div>
                </template>
              </q-editor>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn glossy label="next" color="primary" type="submit" padding="xs lg" />
          </q-card-actions>
        </q-form>
      </q-card>

      <q-card v-if="step === 2" class="step-card">
        <q-card-section class="q-pt-lg">
          <div class="text-h6">Candidate Requirements</div>
          <p>Specify the desired qualifications. These fields are optional but recommended.</p>
        </q-card-section>
        <q-card-section class="q-gutter-y-lg">
            <q-input v-model.number="form.experience" type="number" label="Minimum Experience (years)" filled stack-label hint="Empty will be considered as 0" />
           <q-input v-model="form.skills" label="Key Skills" filled stack-label hint="Enter skills separated by commas" />
          <q-select  v-model="form.education" label="Education Level"  :options="educationOptions"  filled  stack-label  emit-value  map-options  hint="Select highest education level"/>

        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Back" color="black" @click="step--" />
          <q-btn glossy color="primary" label="next" @click="nextStep" padding="xs lg" />
        </q-card-actions>
      </q-card>

       <q-card v-if="step === 3" class="step-card">
         <q-card-section class="q-pt-lg">
           <div class="text-h6">Application Preferences</div>
           <p>Set how you want to receive and manage applications.</p>
         </q-card-section>
         <q-form @submit.prevent="nextStep">
           <q-card-section class="q-gutter-y-xl">
             <q-option-group v-model="form.communication" :options="[{ label: 'Email', value: 'email' }, { label: 'website', value: 'website' }]" type="checkbox" label="Preferred Communication Methods" inline />
             <q-input
  v-model="form.deadline"
  label="Application Deadline"
  type="date"
  filled
  stack-label
  :min="today"
  required
/>
             <q-toggle v-model="form.resumeRequired" label="Resume submission is required" left-label />
           </q-card-section>
           <q-card-actions align="right" class="q-pa-md">
             <q-btn flat label="Back" color="black" @click="step--" />
             <q-btn glossy color="primary" label="next" type="submit" padding="xs lg" />
           </q-card-actions>
         </q-form>
       </q-card>

      <q-card v-if="step === 4" class="step-card">
        <q-card-section class="q-pt-lg">
          <div class="text-h6">Review & Submit</div>
          <p>Please review all the information carefully before submitting.</p>
        </q-card-section>
        <q-card-section class="q-gutter-y-lg">
          <div class="text-h6 text-primary q-mb-sm">Job Details</div>
          <q-list bordered separator class="rounded-borders">
            <q-item>
              <q-item-section>
                <q-item-label overline>Job Title</q-item-label>
                <q-item-label>{{ form.title || 'N/A' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Location</q-item-label>
                <q-item-label>{{ form.location || 'N/A' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Job Type</q-item-label>
                <q-item-label class="text-capitalize">{{ form.type?.replace('_', ' ') || 'N/A' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Positions Available</q-item-label>
                <q-item-label>{{ form.positions || 'N/A' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Salary Range</q-item-label>
                <q-item-label>{{ form.salary || 'N/A' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Recruitment Timeline</q-item-label>
                <q-item-label>{{ form.timeline || 'N/A' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="form.benefits">
              <q-item-section>
                <q-item-label overline>Benefits</q-item-label>
                <q-item-label>{{ form.benefits }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="form.tags && form.tags.length">
              <q-item-section>
                <q-item-label overline>Job Tags</q-item-label>
                <q-item-label>
                  <q-chip v-for="tag in form.tags" :key="tag" :label="tag" color="primary" text-color="white" size="sm" class="q-mr-xs" />
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Description</q-item-label>
                <q-item-label caption class="q-pt-xs">{{ plainDescription || 'N/A' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="text-h6 text-primary q-mb-sm">Candidate Requirements</div>
          <q-list bordered separator class="rounded-borders">
            <q-item>
              <q-item-section>
                <q-item-label overline>Experience</q-item-label>
                <q-item-label>{{ form.experience || 'Not specified' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Key Skills</q-item-label>
                <q-item-label>{{ form.skills || 'Not specified' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Education Level</q-item-label>
                <q-item-label>{{ educationLabel }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="text-h6 text-primary q-mb-sm">Application Preferences</div>
          <q-list bordered separator class="rounded-borders">
            <q-item>
              <q-item-section>
                <q-item-label overline>Communication Methods</q-item-label>
                <q-item-label class="text-capitalize">{{ form.communication.join(', ') || 'N/A' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Application Deadline</q-item-label>
                <q-item-label>{{ form.deadline || 'N/A' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Resume Required</q-item-label>
                <q-item-label>{{ form.resumeRequired ? 'Yes' : 'No' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-if="submitted" class="text-positive q-mt-md text-center text-subtitle1">
            <q-icon name="check_circle" /> Status: <strong>Pending Admin Approval</strong>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Back" color="black" @click="step--" :disable="submitted" />
          <q-btn glossy label="submit job" color="primary" @click="submitJob" :loading="submitted" padding="xs lg"
            icon-right="send" />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date  } from 'quasar';
import { useRouter } from 'vue-router';
import jobService from '../services/jobpost.service';
import { api } from 'boot/axios';
import AppHeader from 'src/components/HeaderPart.vue';

// Initialize stores and utilities
const router = useRouter();
const $q = useQuasar();

// Refs for form state
const step = ref(1);
const submitted = ref(false);
const tagInput = ref('');
const loading = ref(false);

// Initialize employer with default values
const employer = ref({
  name: 'Innovate Inc.',
  email: 'hr@innovate.com',
  status: 'pending',
  rejectionReason: ''
});

// UI state
const selected = ref('Post New Job');
const verificationStatus = ref('');
const rejectionReason = ref('');
const today = date.formatDate(new Date(), 'YYYY-MM-DD');
// Education options for the form
const educationOptions = [
  { label: '10th (SSC)', value: '10th' },
  { label: '12th (HSC)', value: '12th' },
  { label: 'Diploma', value: 'diploma' },
  { label: 'Graduation (Bachelor\'s)', value: 'Bachelor' },
  { label: 'Post Graduation (Master\'s)', value: 'Master' },
  { label: 'PhD / Doctorate', value: 'PHD' }
];

// Fetch company status from server
const fetchCompanyStatus = async () => {
  try {
    loading.value = true;
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

      // Update local storage with the latest status
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
    // Fallback to local storage data if available
    const storedEmployer = localStorage.getItem('employerData');
    if (storedEmployer) {
      const employerData = JSON.parse(storedEmployer);
      verificationStatus.value = employerData.status || '';
      rejectionReason.value = employerData.rejectionReason || '';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const stored = localStorage.getItem('employerData');
  if (stored) {
    const employerData = JSON.parse(stored);
    employer.value = employerData;
    verificationStatus.value = employerData.status || '';
    rejectionReason.value = employerData.rejectionReason || '';
  }

  // Fetch fresh status from server
  await fetchCompanyStatus();
});

const links = [
  { label: 'Dashboard Overview', icon: 'dashboard', to: '/employer-portal' },
  { label: 'Posted Jobs', icon: 'work', to: '/posted-jobs' },
  { label: 'Post New Job', icon: 'add_box', to: '/post-job' },
  { label: 'Candidates', icon: 'groups', to: '/candidates' },
  { label: 'Messages', icon: 'mail', to: '/employer-messages' },
  { label: 'Company Profile', icon: 'domain', to: '/company-profile' },
  { label: 'Settings', icon: 'settings' }
];

const navigate = (link) => {
  selected.value = link.label;
  if (link.to) router.push(link.to);
};

const stepSections = [
  'Job Details', 'Candidate Requirements', 'Application Preferences', 'Review & Submit'
];

const form = ref({
  title: '', location: '', type: null, positions: 1, timeline: '', salary: '', benefits: '', description: '',
  experience: '', skills: '', education: '', communication: ['email'], resumeRequired: true, deadline: '',
  tags: []
});

const plainDescription = computed(() => (form.value.description || '').replace(/<[^>]*>/g, '').trim());

// MODIFIED: Added computed property to display education label
const educationLabel = computed(() => {
  if (!form.value.education) return 'Not specified';
  const option = educationOptions.find(opt => opt.value === form.value.education);
  return option ? option.label : form.value.education;
});

const descriptionRules = [val => (val && plainDescription.value.length >= 200) || 'Minimum 200 characters required.'];

const nextStep = () => { if (step.value < 4) step.value++ };

const addTag = () => {
  if (tagInput.value.trim()) {
    form.value.tags.push(tagInput.value.trim());
    tagInput.value = ''; // Clear input after adding
  }
};

const onTagKeyup = (event) => {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    addTag();
  }
};

const submitJob = async () => {
  submitted.value = true;

  if (verificationStatus.value !== 'approved') {
    $q.dialog({
      title: 'Post Job as Pending',
      message: 'Your company is not yet verified. The job will be saved but will not be visible to candidates until your company is approved. Continue?',
      persistent: true,
      ok: {
        label: 'Yes, Post as Pending',
        color: 'primary',
        flat: true
      },
      cancel: {
        label: 'Cancel',
        color: 'grey',
        flat: true
      }
    }).onOk(async () => {
      await processJobSubmission();
    });
  } else {
    await processJobSubmission();
  }
};

const processJobSubmission = async () => {
  try {
    loading.value = true;

    const storedUser = localStorage.getItem('userData');
    if (!storedUser) {
      throw new Error('User not authenticated');
    }

    const userData = JSON.parse(storedUser);
    
    const jobData = {
      title: form.value.title,
      description: form.value.description,
      location: form.value.location,
      type: form.value.type,
      salary: form.value.salary ? Number(form.value.salary) : 0,
      deadline: form.value.deadline || null,
      skills: Array.isArray(form.value.skills) ? form.value.skills : (form.value.skills ? [form.value.skills] : []),
      tags: Array.isArray(form.value.tags) ? form.value.tags : (form.value.tags ? [form.value.tags] : []),
      benefits: form.value.benefits || '',
      education: form.value.education || '',
      company_id: userData.id
    };

    const response = await jobService.postJob(jobData);

    if (response.success) {
      const isPending = response.status === 'pending';

      $q.notify({
        type: isPending ? 'info' : 'positive',
        message: isPending
          ? 'Job saved successfully! It will be reviewed once your company is verified.'
          : 'Job posted successfully and is now live!',
        position: 'top',
        timeout: 5000,
        icon: isPending ? 'pending_actions' : 'check_circle'
      });

      resetForm();
      
      router.push('/employer-portal');
    } else {
      $q.notify({
        type: 'negative',
        message: response.error || 'Failed to post job. Please try again.',
        position: 'top',
        timeout: 3000,
        icon: 'error'
      });
    }
  } catch (error) {
    console.error('Error submitting job:', error);
    $q.notify({
      type: 'negative',
      message: 'An error occurred while posting the job. Please try again.',
      position: 'top',
      timeout: 3000,
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    title: '', location: '', type: null, positions: 1, timeline: '', salary: '', benefits: '', description: '',
    experience: '', skills: '', education: '', communication: ['email'], resumeRequired: true, deadline: '',
    tags: []
  };
};
</script>

<style scoped>
/* Styles are unchanged */
.portal-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
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

.sidebar,
.content-area {
  height: 100%;
}

.content-area {
  flex: 1;
  overflow-y: auto;
}

.page-wrapper {
  height: 100vh;
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

.logo-section {
  border-bottom-color: transparent;
}

.nav-list .q-item {
  color: #BCCCDC;
  padding: 12px;
  margin: 4px 12px;
  border-radius: 8px;
}

.nav-list .q-item:hover {
  background-color: #243B55;
  color: #ffffff;
}

.active-link {
  background-color: #00529b !important;
  color: #ffffff !important;
  font-weight: 600;
}

.logout-btn {
  color: #FFB5B5;
  border-radius: 8px;
  margin: 16px;
}

.logout-btn:hover {
  background-color: #d32f2f;
  color: #ffffff;
}

.content-area {
  flex: 1;
  overflow-y: auto;
}

.post-job-bg {
  min-height: 100vh;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #eef5ff 100%);
}

.step-indicator-container {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}
</style>