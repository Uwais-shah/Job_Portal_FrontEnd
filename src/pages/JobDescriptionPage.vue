<template>
  <div class="job-description-page">
    <AppHeader />
    <q-page padding class="bg-grey-1">
      <div class="row justify-center">
        <div class="col-12 col-md-10">
          <div v-if="loading" class="q-my-xl text-center">
            <q-spinner-dots size="40px" color="primary" />
            <div>Loading job details...</div>
          </div>

          <div v-else-if="job" class="row q-col-gutter-xl">
            <!-- Main Content -->
            <div class="col-12 col-md-8">
              <JobHeader :job="job" />
              <JobOverview v-if="job.description" :job="job" />
              <div v-else class="q-pa-md text-grey">No overview listed.</div>
              <KeyResponsibilities  v-if="job.KeyResponsibilities" :job="job" />

              <RequiredSkills v-if="job.skills.length" :job="job" />
              <div v-else class="q-pa-md text-grey">No skills required.</div>
              <ApplicationProcess :job="job" />
              <CompanyInfo :job="job" />

              <!-- Company Reviews Section -->
              <div class="q-mt-xl">
                <div class="text-h5 q-mb-md">Company Reviews</div>

                <div v-if="reviewsLoading" class="text-center q-my-lg">
                  <q-spinner-dots size="40px" color="primary" />
                  <div>Loading reviews...</div>
                </div>

                <div v-else-if="reviews.length === 0" class="text-center q-pa-lg bg-grey-2 rounded-borders">
                  <q-icon name="reviews" size="48px" color="grey-5" class="q-mb-sm" />
                  <div class="text-h6 q-mb-sm">No reviews yet</div>
                  <p class="text-grey-7">Be the first to share your experience with this company</p>
                </div>

                <div v-else class="q-mb-xl">
                  <div class="q-gutter-y-md">
                    <q-card v-for="review in reviews" :key="review.id" class="review-card">
                      <q-card-section>
                        <div class="row items-center q-mb-sm">
                          <q-avatar color="primary" text-color="white" size="md" class="q-mr-sm">
                            {{ review.reviewer?.name?.charAt(0) || 'U' }}
                          </q-avatar>
                          <div>
                            <div class="text-subtitle1">{{ review.reviewer?.name || 'Anonymous' }}</div>
                            <div class="row items-center">
                              <q-rating
                                v-model="review.rating"
                                size="1.2em"
                                color="amber"
                                readonly
                                :max="5"
                              />
                              <span class="text-caption text-grey-7 q-ml-sm">
                                {{ formatDate(review.created_at) }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="q-pl-lg">
                          <p class="q-my-sm">{{ review.comment }}</p>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="row q-mt-xl q-mb-lg">
                <div class="col-12">
                  <div class="action-buttons">
                    <!-- Post Review Button -->
                    <q-btn
                      color="primary"
                      icon="star"
                      label="Post a Review"
                      class="q-mr-sm"
                      @click="openReviewModal"
                      :aria-label="'Post a review for ' + (job.company?.name || 'this company')"
                      unelevated
                    >
                      <q-tooltip>
                        Share your experience — 1–5 stars and optional comment.
                      </q-tooltip>
                    </q-btn>

                    <!-- Report Company Button -->
                    <q-btn
                      flat
                      color="negative"
                      icon="flag"
                      label="Report Company"
                      @click="openReportModal"
                      :aria-label="'Report ' + (job.company?.name || 'this company')"
                    >
                      <q-tooltip>
                        Report inappropriate content or behavior
                      </q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="col-12 col-md-4">
              <SalaryBenefits :job="job" />
              <ReadyToApply v-if="!isSignedIn" :job="job" />
            </div>
          </div>

          <div v-else class="text-negative text-center q-mt-lg">
            <q-icon name="error" size="2em" />
            <p>Failed to load job data. Please try again later.</p>
          </div>
        </div>
      </div>
    </q-page>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar, Loading } from 'quasar'
import jobService from '../services/job.service.js'
// Components

import JobHeader from '../components/JobHeader.vue'
import JobOverview from '../components/JobOverview.vue'
import KeyResponsibilities from '../components/KeyResponsibilities.vue'
import RequiredSkills from '../components/RequiredSkills.vue'
import ApplicationProcess from '../components/ApplicationProcess.vue'
import CompanyInfo from '../components/CompanyInfo.vue'
import SalaryBenefits from '../components/SalaryBenefits.vue'
import ReadyToApply from '../components/ReadyToApply.vue'
import { useAuthStore } from 'src/stores/auth.store'; // import your store

const route = useRoute()
const $q = useQuasar()
const job = ref(null)
const loading = ref(true)
const reviews = ref([])
const reviewsLoading = ref(false)
const companyId = ref(null)

// Company ID ref - will be set when job data loads

// Import authHelpers
import { authHelpers } from 'src/services/auth.service';

// Handle posting a review
const postReview = async (reviewData) => {
  const token = authHelpers.getToken();
  if (!token) {
    $q.notify({
      type: 'warning',
      message: 'Please log in to post a review',
      position: 'top'
    });
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/company/${companyId.value}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rating: reviewData.rating,
        comment: reviewData.comment
      })
    });

    const result = await response.json();

    if (response.ok) {
      $q.notify({
        type: 'positive',
        message: 'Thank you for your review!',
        position: 'top'
      });
    } else {
      throw new Error(result.message || 'Failed to post review');
    }
  } catch (error) {
    console.error('Error posting review:', error);
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to post review',
      position: 'top'
    });
  }
};

// Open review dialog
const openReviewModal = () => {
  if (!companyId.value) {
    $q.notify({
      type: 'warning',
      message: 'Company information not available for review.'
    });
    return;
  }

  $q.dialog({
    title: 'Write a Review',
    message: 'Share your experience with this company',
    prompt: {
      model: '',
      type: 'textarea',
      isValid: val => val.length <= 500,
      attrs: {
        placeholder: 'Share your experience (optional)'
      }
    },
    cancel: true,
    persistent: true,
    ok: {
      label: 'Submit',
      color: 'primary'
    },
    html: true
  }).onOk(async (comment) => {
    // Show rating dialog after comment
    $q.dialog({
      title: 'Rate the Company',
      message: 'How would you rate your experience?',
      options: {
        type: 'radio',
        model: 5,
        items: [
          { label: '⭐️⭐️⭐️⭐️⭐️ Excellent', value: 5 },
          { label: '⭐️⭐️⭐️⭐️ Very Good', value: 4 },
          { label: '⭐️⭐️⭐️ Average', value: 3 },
          { label: '⭐️⭐️ Below Average', value: 2 },
          { label: '⭐️ Poor', value: 1 }
        ]
      },
      cancel: true,
      persistent: true
    }).onOk(async (rating) => {
      await postReview({
        rating,
        comment: comment || ''
      });
    });
  });
};

// Handle submitting a report
const submitReport = async (reason) => {
  console.log('[1] submitReport called with reason:', reason);

  try {
    // Get token from auth store or localStorage
    const token = auth.token || localStorage.getItem('authToken');
    console.log('[2] Auth token:', token ? 'Found' : 'Not found');

    if (!token) {
      throw new Error('Please log in to report a company');
    }

    if (!companyId.value) {
      console.error('[3] No companyId found in job data:', job.value);
      throw new Error('Unable to identify company');
    }

    const url = `http://localhost:3000/api/company/report/${companyId.value}`;
    console.log('[4] Making API call to:', url);

    const requestBody = { comment: reason };
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    };

    console.log('[5] Request options:', {
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer [REDACTED]'
      },
      body: requestBody
    });

    console.log('[6] Sending request...');
    const response = await fetch(url, requestOptions);
    console.log('[7] Received response status:', response.status);

    const responseText = await response.text();
    console.log('[8] Raw response text:', responseText);

    let result;
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('[9] Error parsing JSON response:', e);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      console.error('[10] API error:', {
        status: response.status,
        statusText: response.statusText,
        response: result
      });
      throw new Error(result.message || `Failed to submit report (${response.status})`);
    }

    console.log('[11] Report submitted successfully');
    return { success: true, data: result };

  } catch (error) {
    console.error('[12] Error in submitReport:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

// Open report modal
const openReportModal = () => {
  console.log('1. openReportModal called');

  if (!companyId.value) {
    console.error('2. No companyId found');
    $q.notify({
      type: 'warning',
      message: 'Unable to identify company to report.'
    });
    return;
  }

  console.log('3. Company ID:', companyId.value);

  $q.dialog({
    title: 'Report Company',
    message: 'Please provide a reason for reporting this company',
    prompt: {
      model: '',
      type: 'textarea',
      isValid: val => val && val.length >= 10,
      attrs: {
        placeholder: 'Please provide detailed reason for reporting (minimum 10 characters)',
        required: true
      }
    },
    persistent: true,
    ok: {
      label: 'Submit Report',
      color: 'negative',
      flat: true
    },
    cancel: true
  }).onOk(async (reason) => {
    console.log('4. Dialog OK clicked with reason:', reason);

    // Show loading indicator using the Loading plugin directly
    Loading.show({
      message: 'Submitting report...'
    });

    try {
      console.log('5. Calling submitReport');
      const result = await submitReport(reason);
      console.log('6. submitReport result:', result);

      $q.notify({
        type: 'positive',
        message: 'Report submitted successfully',
        position: 'top'
      });
    } catch (error) {
      console.error('7. Error in report submission:', error);
      $q.notify({
        type: 'negative',
        message: error.message || 'Failed to submit report',
        position: 'top'
      });
    } finally {
      console.log('8. Hiding loading indicator');
      Loading.hide();
    }
  });
};
const auth = useAuthStore();
const isSignedIn = ref(auth.isAuthenticated);

// Debug auth state
console.log('Auth store initialized:', {
  isAuthenticated: auth.isAuthenticated,
  user: auth.user,
  token: auth.token || 'No token in store'
});

// Check if we have a token in localStorage
const checkAuthToken = () => {
  const storedToken = localStorage.getItem('authToken');
  console.log('Stored auth token:', storedToken ? 'Found' : 'Not found');
  return storedToken;
};

// Check token on component mount
checkAuthToken();

// Fetch company reviews
const fetchCompanyReviews = async () => {
  if (!companyId.value) return;

  reviewsLoading.value = true;
  try {
    const response = await fetch(`http://localhost:3000/api/company/${companyId.value}/reviews`);
    const result = await response.json();

    if (response.ok) {
      reviews.value = result.data || [];
    } else {
      throw new Error(result.message || 'Failed to fetch reviews');
    }
  } catch (error) {
    console.error('Error fetching company reviews:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load company reviews',
      position: 'top'
    });
  } finally {
    reviewsLoading.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  try {
    console.log('Loading job with ID:', route.params.id);
    const response = await jobService.getJobById(route.params.id);
    job.value = response.job || response; // Handle both response formats

    // Debug log the job data and company ID
    console.log('Job data loaded:', {
      job: job.value,
      companyId: job.value?.company_id || job.value?.company?.id,
      hasCompany: !!job.value?.company
    });

    // Set companyId ref if not already set
    if (job.value?.company_id || job.value?.company?.id) {
      companyId.value = job.value.company_id || job.value.company.id;
      console.log('Set companyId to:', companyId.value);
      await fetchCompanyReviews();
    }
  } catch (err) {
    console.error('Failed to load job:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to load job details',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
})

</script>

<style scoped>
.job-description-page {
  font-family: 'Inter', sans-serif;
  background-color: #f5f7fa;
}

.q-page {
  min-height: 100vh;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 1rem 0;
  border-top: 1px solid #e0e0e0;
  margin-top: 2rem;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-buttons .q-btn {
    width: 100%;
  }
}

.review-card {
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.review-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
