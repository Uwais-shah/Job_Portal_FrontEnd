<template>
  <div class="job-listing-page">
    <q-page class="q-pa-md job-page-wrapper">
      <div class="job-page-content">
        <div class="col-12 col-lg-5 job-list-pane">
          <div v-if="!searchQuery && authHelpers.getCurrentUser()" class="text-h6 text-primary text-weight-bold q-mb-md">
            🚀 Suggested for You
          </div>

          <q-expansion-item
            icon="tune"
            label="Filters"
            class="q-mb-md filter-expansion"
            header-class="text-weight-bold"
          >
            <div class="q-pa-md bg-blue-1 rounded-borders">
              <q-select
                v-model="sortOption"
                :options="sortOptions"
                label="Sort By"
                outlined
                dense
                class="q-mb-md"
                bg-color="white"
              />

              <q-select
                v-model="filters.workMode"
                :options="workModeOptions"
                label="Work Mode"
                outlined
                dense
                multiple
                use-chips
                class="q-mb-md"
                bg-color="white"
              />

              <div class="q-mb-md">
                <q-item-label class="q-mb-sm text-weight-medium">Salary Range (per month)</q-item-label>
                <div class="row q-gutter-sm">
                  <q-input
                    v-model.number="filters.salaryRange.min"
                    type="number"
                    label="Min Salary"
                    outlined
                    dense
                    class="col"
                    :min="0"
                    bg-color="white"
                    prefix="₹"
                  />
                  <q-input
                    v-model.number="filters.salaryRange.max"
                    type="number"
                    label="Max Salary"
                    outlined
                    dense
                    class="col"
                    :min="0"
                    bg-color="white"
                    prefix="₹"
                  />
                </div>
              </div>

              <q-select
                v-model="filters.skills"
                :options="availableSkills"
                label="Skills"
                outlined
                dense
                multiple
                use-chips
                use-input
                @filter="filterSkills"
                class="q-mb-md"
                bg-color="white"
              />

              <q-select
                v-model="filters.experienceLevel"
                :options="experienceLevelOptions"
                label="Experience Level"
                outlined
                dense
                multiple
                use-chips
                option-value="value"
                option-label="label"
                emit-value
                map-options
                class="q-mb-md"
                bg-color="white"
              />

              <q-select
                v-model="filters.postedDate"
                :options="postedDateOptions"
                label="Posted Date"
                outlined
                dense
                option-value="value"
                option-label="label"
                emit-value
                map-options
                class="q-mb-md"
                bg-color="white"
              />

              <q-btn
                label="Clear All Filters"
                color="red-5"
                flat
                icon="delete_sweep"
                size="md"
                @click="clearFilters"
                class="full-width q-mt-sm"
              />
            </div>
          </q-expansion-item>

          <div class="text-caption text-grey-7 q-mb-sm q-px-sm">
            Showing {{ filteredJobs.length }} {{ filteredJobs.length === 1 ? 'job' : 'jobs' }}
          </div>

          <div class="job-list-scroll">
            <q-card
              v-for="job in filteredJobs"
              :key="job.id"
              class="q-mb-sm job-card"
              :class="{ 'selected-job-card': selectedJobId === job.id }"
              @click="selectJob(job)"
            >
              <q-card-section class="q-pa-md">
                 <div class="row items-start no-wrap">
                    <q-avatar size="48px" font-size="28px" color="blue-1" text-color="primary" icon="business" class="q-mr-md" />
                    <div class="full-width">
                      <div class="text-body1 text-weight-bold text-primary job-title">{{ job.title }}</div>
                      <div class="text-caption text-grey-8 company-name">{{ job.companyName }}</div>

                      <div class="row items-center text-caption text-grey-8 q-mt-sm q-gutter-x-md q-gutter-y-xs">
                        <div class="row items-center no-wrap">
                          <q-icon name="place" size="16px" class="q-mr-xs" />
                          <span>{{ job.location }}</span>
                        </div>
                        <div class="row items-center no-wrap">
                          <q-icon name="paid" size="16px" class="q-mr-xs" />
                          <span>{{ job.salary }}</span>
                        </div>
                         <div class="row items-center no-wrap">
                          <q-icon name="schedule" size="16px" class="q-mr-xs" />
                          <span>{{ timeAgo(job.postedAt) }}</span>
                        </div>
                         <div class="row items-center no-wrap">
                          <q-icon name="work_history" size="16px" class="q-mr-xs" />
                           <span>{{ job.experience_min && job.experience_min > 0 ? job.experience_min + ' yrs' : 'Fresher' }}</span>
                        </div>
                      </div>
                    </div>
                 </div>

                 <div class="q-mt-md">
                   <q-badge v-if="job.mode === 'Remote'" color="green-1" text-color="green-8" :label="job.mode" class="q-mr-sm" />
                   <q-badge v-if="job.mode === 'Hybrid'" color="blue-1" text-color="blue-8" :label="job.mode" class="q-mr-sm" />
                   <q-badge v-if="job.mode === 'Work from Office'" color="purple-1" text-color="purple-8" label="On-site" class="q-mr-sm" />

                   <q-chip
                      v-for="(skill, i) in job.skills.slice(0, 3)"
                      :key="i"
                      color="grey-3"
                      text-color="grey-8"
                      size="sm"
                      class="q-mr-xs"
                   >
                     {{ skill }}
                   </q-chip>
                   <q-chip
                      v-if="job.skills.length > 3"
                      color="grey-4"
                      text-color="grey-9"
                      size="sm"
                   >
                     +{{ job.skills.length - 3 }} more
                   </q-chip>
                 </div>
              </q-card-section>
            </q-card>

            <div v-if="filteredJobs.length === 0" class="empty-state-container q-mt-lg">
              <q-icon name="search_off" size="48px" color="grey-5" class="q-mb-md" />
              <div v-if="hasActiveFilters" class="text-subtitle1 text-grey-7">
                No jobs match your filters.
                <q-btn
                  label="Clear Filters"
                  color="primary"
                  flat
                  size="sm"
                  class="q-mt-sm"
                  @click="clearFilters"
                />
              </div>
              <div v-else-if="searchQuery" class="text-subtitle1 text-grey-7">
                No jobs found for "<strong>{{ searchQuery }}</strong>"
              </div>
              <div v-else-if="!authHelpers.getCurrentUser()" class="text-subtitle1 text-grey-7">
                Please <router-link to="/login">log in</router-link> to get suggestions.
              </div>
              <div v-else class="text-subtitle1 text-grey-7">
                No job suggestions available.
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-7 job-detail-pane">
           <div v-if="loadingDetail" class="full-height flex flex-center">
            <div class="text-center">
               <q-spinner-dots size="48px" color="primary" />
               <div class="q-mt-md text-grey-7">Loading job details...</div>
             </div>
           </div>

           <div v-else-if="selectedJob" class="job-detail-scroll">
             <JobDetailContent :job="selectedJob" />
           </div>

           <div v-else class="full-height flex flex-center select-job-to-see">
             <div class="text-center text-grey-6">
                <q-icon name="touch_app" size="64px" class="q-mb-md" />
                <div class="text-h6">Select a job to see the details</div>
              </div>
          </div>
        </div>
      </div>
    </q-page>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authHelpers } from '../services/auth.service';
import api from '../services/auth.service';
import searchService from '../services/search.service';
import suggestService from '../services/suggest.service';

import JobDetailContent from './JobDetailContent.vue';

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  }
});

const experienceLevelOptions = [
  { label: 'Fresher (0-1 years)', value: 0 },
  { label: '1-3 years', value: 1 },
  { label: '3-5 years', value: 2 },
  { label: '5+ years', value: 3 }
];

const postedDateOptions = [
  { label: 'Last 24 hours', value: 1 },
  { label: 'Last 3 days', value: 3 },
  { label: 'Last week', value: 7 },
  { label: 'Last 2 weeks', value: 14 },
  { label: 'Last month', value: 30 }
];

function timeAgo(dateString) {
  const now = new Date();
  const posted = new Date(dateString);
  const seconds = Math.floor((now - posted) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
}

const route = useRoute();
const category = computed(() => route.params.category?.toLowerCase().trim() || '');

const jobList = ref([]);
const sortOption = ref({ label: 'Date: Newest First', value: 'dateDesc' });

const sortOptions = [
  { label: 'Salary: High to Low', value: 'salaryDesc' },
  { label: 'Salary: Low to High', value: 'salaryAsc' },
  { label: 'Date: Newest First', value: 'dateDesc' },
  { label: 'Date: Oldest First', value: 'dateAsc' },
  { label: 'Best Match', value: 'matchDesc' }
];

const workModeOptions = ['Remote', 'Hybrid', 'Work from Office'];

const filters = ref({
  workMode: [],
  salaryRange: { min: 0, max: 1000000 },
  skills: [],
  experienceLevel: [],
  companySize: null,
  postedDate: null,
  location: ''
});

const availableSkills = ref([]);
const skillsOptions = ref([]);

const searchTerm = ref(props.searchQuery?.toLowerCase().trim() || '');
const locationTerm = ref(props.location?.toLowerCase().trim() || '');
const loadingDetail = ref(false);
const selectedJobId = ref(null);
const selectedJob = ref(null);

const safeParseJson = (input) => {
  if (Array.isArray(input)) return input;
  if (!input && input !== '') return [];
  if (typeof input !== 'string') return [];
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return input
      .toString()
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }
};

const deriveMode = (job) => {
  const modeVal = (job.mode || job.location || job.type || '').toString().toLowerCase();
  if (modeVal.includes('remote')) return 'Remote';
  if (modeVal.includes('hybrid')) return 'Hybrid';
  return 'Work from Office';
};

const normalizeJob = (job) => {
  const parsedSkills = safeParseJson(job.skills);
  const parsedTags = safeParseJson(job.tags);
  const effectiveTags = parsedSkills.length ? parsedSkills : parsedTags;

  return {
    id: job.id ?? job.jobId ?? job.job_id ?? null,
    jobId: job.jobId ?? job.id ?? job.job_id ?? null,
    title: job.title ?? 'Untitled',
    company_name: job.company_name ?? job.company?.companyName ?? job.employer ?? 'Unknown Company',
    companyName: job.companyName ?? job.company_name ?? job.company?.companyName ?? job.employer ?? 'Unknown Company',
    location: job.location ?? 'N/A',
    salary: job.salary ?? job.salary_range ?? 'N/A',
    duration: job.duration ?? '',
    mode: job.mode ?? deriveMode(job),
    skills: parsedSkills,
    tags: effectiveTags,
    postedAt: job.postedAt ?? job.posted_at ?? new Date().toISOString(),
    match: typeof job.match === 'number' ? job.match : parseFloat(job.match) || 0,
    category: (job.category ?? '').toString(),
    experience_min: job.experience_min ?? 0,
    companySize: job.companySize ?? job.company_size ?? ''
  };
};

const fetchJobs = async () => {
  const currentUser = authHelpers.getCurrentUser();
  const isLoggedIn = !!currentUser?.id;

  try {
    let rawJobs = [];

    // 1️⃣ Keyword search
    if (searchTerm.value && searchTerm.value.length > 0) {
      const result = await searchService.searchJobs(searchTerm.value);
      rawJobs = result?.success && Array.isArray(result.data?.jobs) ? result.data.jobs : [];
    }
    // 2️⃣ Suggested jobs for logged-in users
    else if (isLoggedIn) {
      const result = await suggestService.getSuggestions(currentUser.id);
      rawJobs = result?.success && Array.isArray(result.data) ? result.data : [];
    }

    // 3️⃣ Location filter
    const locationFilter = locationTerm.value || (currentUser?.location?.toLowerCase() ?? '');
    if (locationFilter) {
  try {
    const response = await api.get('/jobs/location', {
      params: { location: locationFilter }
    });
    console.log('Jobs by location:', response.data);

    rawJobs = Array.isArray(response.data?.jobs) ? response.data.jobs : [];

  } catch (err) {
    console.error('Failed to fetch jobs by location', err);
    rawJobs = [];
  }
}


    // Normalize jobs
    const mapped = rawJobs.map(normalizeJob);

    // Sort by match if no search term
    if (!searchTerm.value) {
      mapped.sort((a, b) => (b.match || 0) - (a.match || 0));
    }

    jobList.value = mapped;

    // Extract skills for filter dropdown
    const allSkills = new Set();
    mapped.forEach(job => {
      job.skills.forEach(skill => {
        if (skill && skill.trim()) allSkills.add(skill.trim());
      });
    });
    skillsOptions.value = Array.from(allSkills).sort();
    availableSkills.value = skillsOptions.value;

  } catch (err) {
    console.error('Failed to fetch jobs', err);
    jobList.value = [];
  }
};

const parseSalaryRange = (salaryStr) => {
  if (!salaryStr || typeof salaryStr !== 'string') return { min: 0, max: 0, avg: 0 };
  const cleanStr = salaryStr.replace(/[₹$,]/g, '').replace(/\s+/g, ' ').trim();
  const rangePattern = /(\d+(?:\.\d+)?)\s*(?:k|K|lakh|lakhs?)?\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:k|K|lakh|lakhs?)?/i;
  const singlePattern = /(\d+(?:\.\d+)?)\s*(?:k|K|lakh|lakhs?)?/i;
  let matches = cleanStr.match(rangePattern);
  if (matches) {
    let min = parseFloat(matches[1]);
    let max = parseFloat(matches[2]);
    if (/k|K/i.test(matches[0])) { min *= 1000; max *= 1000; }
    if (/lakh|lakhs/i.test(matches[0])) { min *= 100000; max *= 100000; }
    return { min, max, avg: Math.round((min + max) / 2) };
  }
  matches = cleanStr.match(singlePattern);
  if (matches) {
    let value = parseFloat(matches[1]);
    if (/k|K/i.test(matches[0])) { value *= 1000; }
    if (/lakh|lakhs/i.test(matches[0])) { value *= 100000; }
    return { min: value, max: value, avg: value };
  }
  return { min: 0, max: 0, avg: 0 };
};

const parseJobDate = (job) => {
  const rawDate = job.postedAt || job.posted_at || job.created_at || '';
  if (!rawDate) return 0;
  const date = new Date(rawDate);
  return isNaN(date) ? 0 : date.getTime();
};

const isWithinDateRange = (job, days) => {
  if (!days) return true;
  const jobDate = parseJobDate(job);
  if (jobDate === 0) return false;
  const now = Date.now();
  const cutoff = now - (days * 24 * 60 * 60 * 1000);
  return jobDate >= cutoff;
};

const hasActiveFilters = computed(() => {
  return filters.value.workMode.length > 0 ||
         filters.value.salaryRange.min > 0 ||
         filters.value.salaryRange.max < 1000000 ||
         filters.value.skills.length > 0 ||
         filters.value.experienceLevel.length > 0 ||
         filters.value.companySize !== null ||
         filters.value.postedDate !== null;
});

const filteredJobs = computed(() => {
  const jobs = Array.isArray(jobList.value) ? jobList.value : [];
  const cat = category.value;
  let result = jobs.filter(job => {
    const { min, max, avg } = parseSalaryRange(job.salary);
    const jobCat = (job.category ?? '').toLowerCase().trim();
    if (cat && jobCat !== cat) return false;
    if (filters.value.workMode.length > 0 && !filters.value.workMode.includes(job.mode)) return false;
    if (max > 0 && filters.value.salaryRange.min > 0 && avg < filters.value.salaryRange.min) return false;
    if (min > 0 && filters.value.salaryRange.max < 1000000 && avg > filters.value.salaryRange.max) return false;
    if (filters.value.skills.length > 0) {
      const jobSkills = Array.isArray(job.skills) ? job.skills.map(s => s.toLowerCase()) : [];
      const hasSkill = filters.value.skills.some(skill =>
        jobSkills.some(jobSkill => jobSkill.includes(skill.toLowerCase()))
      );
      if (!hasSkill) return false;
    }
    if (locationTerm.value && !job.location?.toLowerCase().includes(locationTerm.value)) {
      return false;
    }

    if (filters.value.experienceLevel.length > 0) {
      const exp = Number(job.experience_min) || 0;
      const hasLevel = filters.value.experienceLevel.some(level => {
        if (level === 0) return exp >= 0 && exp <= 1;
        if (level === 1) return exp >= 1 && exp <= 3;
        if (level === 2) return exp > 3 && exp <= 5;
        if (level === 3) return exp > 5;
        return false;
      });
      if (!hasLevel) return false;
    }
    if (filters.value.companySize && job.companySize !== filters.value.companySize) return false;
    if (filters.value.postedDate && !isWithinDateRange(job, filters.value.postedDate)) return false;
    if (searchTerm.value && searchTerm.value.length > 0) {
      const searchLower = searchTerm.value.toLowerCase();
      const titleMatch = job.title.toLowerCase().includes(searchLower);
      const companyMatch = (job.company_name || '').toLowerCase().includes(searchLower);
      const skillsMatch = job.skills.some(skill => skill.toLowerCase().includes(searchLower));
      const locationMatch = job.location.toLowerCase().includes(searchLower);
      if (!titleMatch && !companyMatch && !skillsMatch && !locationMatch) return false;
    }
    return true;
  });

  const sortValue = sortOption.value?.value || 'dateDesc';
  if (sortValue === 'salaryDesc') result.sort((a, b) => parseSalaryRange(b.salary).avg - parseSalaryRange(a.salary).avg);
  else if (sortValue === 'salaryAsc') result.sort((a, b) => parseSalaryRange(a.salary).avg - parseSalaryRange(b.salary).avg);
  else if (sortValue === 'dateDesc') result.sort((a, b) => parseJobDate(b) - parseJobDate(a));
  else if (sortValue === 'dateAsc') result.sort((a, b) => parseJobDate(a) - parseJobDate(b));
  else if (sortValue === 'matchDesc') result.sort((a, b) => (b.match || 0) - (a.match || 0));
  return result;
});

const filterSkills = (val, update) => {
  if (val === '') {
    update(() => { availableSkills.value = skillsOptions.value; });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    availableSkills.value = skillsOptions.value.filter(skill =>
      skill.toLowerCase().indexOf(needle) > -1
    );
  });
};

const clearFilters = () => {
  filters.value = {
    workMode: [],
    salaryRange: { min: 0, max: 1000000 },
    skills: [],
    experienceLevel: [],
    companySize: null,
    postedDate: null,
    location: ''
  };
  sortOption.value = { label: 'Date: Newest First', value: 'dateDesc' };
};

watch(() => props.searchQuery, (newQuery) => {
  searchTerm.value = newQuery?.toLowerCase().trim() || '';
  fetchJobs();
});

watch(() => props.location, (newLoc) => {
  locationTerm.value = newLoc?.toLowerCase().trim() || '';
  fetchJobs();
});

onMounted(() => {
  fetchJobs();
});

const router = useRouter();

function selectJob(job) {
  if (!job) return;
  // Navigate to the job details page
  router.push({ name: 'JobDescription', params: { id: job.id } });
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

/* Add this animation at the top of your <style> block */
@keyframes breathing-background {
  0% {
    background-color: #f0f8ff; /* AliceBlue */
  }
  50% {
    background-color: #e3f2fd; /* A slightly deeper light blue */
  }
  100% {
    background-color: #f0f8ff; /* Return to start */
  }
}

/* Update your existing .job-listing-page rule with this */
.job-listing-page {
  font-family: 'Poppins', sans-serif;
  animation: breathing-background 15s ease-in-out infinite;
}

.job-page-wrapper {
  min-height: calc(100vh - 50px); /* Adjust based on your header height */
  padding: 16px;
}

.job-page-content {
  display: flex;
  flex-wrap: nowrap;
  gap: 24px;
  height: calc(100vh - 82px); /* Adjust based on header/padding */
  max-width: 1600px;
  margin: 0 auto;
}

.job-list-pane,
.job-detail-pane {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 80, 150, 0.08);
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
  height: 100%;
  flex: 1;
  min-width: 0;
}

.job-detail-pane {
  position: sticky;
  top: 66px; /* Adjust based on header height */
}

.job-list-scroll,
.job-detail-scroll {
  overflow-y: auto;
  flex-grow: 1;
  padding-right: 12px; /* For scrollbar spacing */
}

/* Custom scrollbar */
.job-list-scroll::-webkit-scrollbar,
.job-detail-scroll::-webkit-scrollbar {
  width: 6px;
}
.job-list-scroll::-webkit-scrollbar-track,
.job-detail-scroll::-webkit-scrollbar-track {
  background: #a4e5ef;
  border-radius: 10px;
}
.job-list-scroll::-webkit-scrollbar-thumb,
.job-detail-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}
.job-list-scroll::-webkit-scrollbar-thumb:hover,
.job-detail-scroll::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.job-card {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background-color: #c8f6f7;
  box-shadow: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
}

.job-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 80, 150, 0.12);
  border-color: var(--q-primary);
}

.selected-job-card {
  border-left: 5px solid var(--q-primary);
  background-color: #b7bcff; /* A light blue for selected state */
}

.job-title {
  line-height: 1.3;
}
.company-name {
  font-weight: 500;
}

.filter-expansion {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
.filter-expansion .q-item {
  background-color: #deabd2;
}

.empty-state-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #f0baba;
  text-align: center;
}

a {
  color: var(--q-primary);
  text-decoration: none;
  font-weight: 500;
}
a:hover {
  text-decoration: underline;
}
.select-job-to-see {
  background-color:#d8d5f7
}
.job-list-pane {
  background-color:#dee2fb;
}
.job-detail-pane{
  background-color:#dee2fb;

}

@media (max-width: 1024px) {
  .job-page-content {
    flex-direction: column;
    height: auto;
  }
  .job-list-pane {
    height: auto;
    max-height: 50vh;
  }
  .job-detail-pane {
    position: static;
    height: auto;
  }
}
</style>
