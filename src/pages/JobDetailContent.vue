<template>
  <div class="job-details-page">
    <div class="row q-col-gutter-xl">
      <div class="col-12 col-md-8">
        <q-card flat bordered class="detail-card">
          <JobHeader :job="job" />
        </q-card>

        <q-card flat bordered class="detail-card">
          <JobOverview v-if="job.description" :job="job" />
          <div v-else class="q-pa-lg text-grey-7">
            <q-icon name="info" class="q-mr-sm" />
            No overview has been provided for this position.
          </div>
        </q-card>

        <q-card flat bordered class="detail-card">
          <KeyResponsibilities v-if="job.KeyResponsibilities" :job="job" />
        </q-card>

        <q-card flat bordered class="detail-card">
          <RequiredSkills v-if="job.skills?.length" :job="job" />
          <div v-else class="q-pa-lg text-grey-7">
            <q-icon name="construction" class="q-mr-sm" />
            No specific skills have been listed.
          </div>
        </q-card>

        <q-card flat bordered class="detail-card">
          <ApplicationProcess :job="job" />
        </q-card>

        <q-card flat bordered class="detail-card">
          <CompanyInfo :job="job" />
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <div class="sticky-sidebar">
          <q-card flat bordered class="detail-card sidebar-card">
            <SalaryBenefits :job="job" />
          </q-card>

          <q-card flat bordered v-if="!isSignedIn" class="detail-card sidebar-card">
            <ReadyToApply :job="job" />
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import JobHeader from '../components/JobHeader.vue'
import JobOverview from '../components/JobOverview.vue'
import KeyResponsibilities from '../components/KeyResponsibilities.vue'
import RequiredSkills from '../components/RequiredSkills.vue'
import ApplicationProcess from '../components/ApplicationProcess.vue'
import CompanyInfo from '../components/CompanyInfo.vue'
import SalaryBenefits from '../components/SalaryBenefits.vue'
import ReadyToApply from '../components/ReadyToApply.vue'
import { useAuthStore } from 'src/stores/auth.store';

const { job } = defineProps({
  job: Object
})

const auth = useAuthStore();
const isSignedIn = computed(() => auth.isAuthenticated);
</script>

<style lang="scss" scoped>
/* Import a clean, modern font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.job-details-page {
  /* Apply the new font family and a soft background color */
  font-family: 'Inter', sans-serif;
  background-color:#dee2fb; /* Changed to a light blue background */
  padding: 24px 0; /* Add some padding to the top and bottom */
  color: #1d3557; /* Changed to a dark navy/slate blue for text */
}

/* Base card styling for a clean, consistent look */
.detail-card {
  margin-bottom: 24px; /* Consistent spacing between cards */
  border-radius: 8px; /* Slightly rounded corners */
  border-color: #d0e6f9; /* Changed to a soft blue border */
  background-color: #ffffff; /* Set to white for clean contrast */
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}

/* Add a subtle lift effect on hover for interactivity */
.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 82, 155, 0.1); /* Blue-tinted shadow */
}

/* Styling for the sticky sidebar */
.sticky-sidebar {
  position: -webkit-sticky; /* For Safari */
  position: sticky;
  top: 24px; /* The distance from the top of the viewport */
}
</style>
