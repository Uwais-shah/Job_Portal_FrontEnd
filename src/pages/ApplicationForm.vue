<template>
  <div class="application-form-page">
    <AppHeader />

    <q-page class="q-pa-md q-py-xl">
      <div class="q-gutter-xl container">
        <!-- Page Header -->
        <div class="page-header q-mb-lg">
          <h5 class="text-h4 q-my-none text-primary">Apply for Senior Frontend Developer</h5>
          <p class="text-subtitle1 text-grey-7 q-mt-sm">Complete all required fields to submit your application.</p>
        </div>

        <!-- Form -->
        <q-form @submit.prevent="submitForm" class="form-container">
          <!-- Personal Information -->
          <q-card class="card-style q-mb-lg">
            <q-card-section class="q-pa-lg">
              <div class="section-title q-mb-md">
                <q-icon name="person" color="primary" size="28px" class="q-mr-sm" />
                Personal Information
              </div>
              <div class="q-gutter-md row items-start">
                <q-input
                  outlined
                  dense
                  label="First Name *"
                  v-model="form.firstName"
                  class="col-12 col-md-6 input-field"
                  :rules="[val => !!val || 'First name is required']"
                  aria-required="true"
                />
                <q-input
                  outlined
                  dense
                  label="Last Name *"
                  v-model="form.lastName"
                  class="col-12 col-md-6 input-field"
                  :rules="[val => !!val || 'Last name is required']"
                  aria-required="true"
                />
                <q-input
                  outlined
                  dense
                  label="Email Address *"
                  type="email"
                  v-model="form.email"
                  class="col-12 col-md-6 input-field"
                  :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Enter a valid email']"
                  aria-required="true"
                >
                  <template v-slot:prepend><q-icon name="email" color="grey-6" size="20px" /></template>
                </q-input>
                <q-input
                  outlined
                  dense
                  label="Phone Number *"
                  type="tel"
                  v-model="form.phone"
                  class="col-12 col-md-6 input-field short-field"
                  :rules="[val => !!val || 'Phone number is required', val => /^[\d\s-+()]+$/.test(val) || 'Enter a valid phone number']"
                  aria-required="true"
                >
                  <template v-slot:prepend><q-icon name="phone" color="grey-6" size="20px" /></template>
                </q-input>
                <q-input
                  outlined
                  dense
                  label="Current Location / City"
                  v-model="form.location"
                  class="col-12 input-field"
                  aria-label="Current location or city"
                >
                  <template v-slot:prepend><q-icon name="location_on" color="grey-6" size="20px" /></template>
                </q-input>
                <q-input
                  outlined
                  dense
                  label="LinkedIn Profile URL"
                  v-model="form.linkedin"
                  class="col-12 col-md-6 input-field"
                  aria-label="LinkedIn profile URL"
                >
                  <template v-slot:prepend><q-icon name="link" color="grey-6" size="20px" /></template>
                </q-input>
                <q-input
                  outlined
                  dense
                  label="Portfolio or Website URL"
                  v-model="form.portfolio"
                  class="col-12 col-md-6 input-field"
                  aria-label="Portfolio or website URL"
                >
                  <template v-slot:prepend><q-icon name="language" color="grey-6" size="20px" /></template>
                </q-input>
              </div>
            </q-card-section>
          </q-card>

          <!-- Education -->
          <q-card class="card-style q-mb-lg">
            <q-card-section class="q-pa-lg">
              <div class="section-title q-mb-md">
                <q-icon name="school" color="primary" size="28px" class="q-mr-sm" />
                Education
              </div>
              <div class="q-gutter-md row items-start">
                <q-select
                  outlined
                  dense
                  label="Highest Qualification *"
                  v-model="form.education.qualification"
                  :options="qualifications"
                  class="col-12 col-md-6 input-field"
                  :rules="[val => !!val || 'Qualification is required']"
                  aria-required="true"
                />
                <q-input
                  outlined
                  dense
                  label="Year of Passing *"
                  type="number"
                  v-model="form.education.passingYear"
                  class="col-12 col-md-6 input-field short-field"
                  :rules="[val => !!val || 'Year is required', val => val >= 1900 && val <= new Date().getFullYear() + 5 || 'Enter a valid year']"
                  aria-required="true"
                />
                <q-input
                  outlined
                  dense
                  label="Institution Name *"
                  v-model="form.education.institution"
                  class="col-12 input-field"
                  :rules="[val => !!val || 'Institution name is required']"
                  aria-required="true"
                />
                <q-input
                  outlined
                  dense
                  label="CGPA / Percentage"
                  v-model="form.education.cgpa"
                  class="col-12 col-md-6 input-field short-field"
                  aria-label="CGPA or percentage"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Work Experience -->
          <q-card class="card-style q-mb-lg">
            <q-card-section class="q-pa-lg">
              <div class="section-title q-mb-md">
                <q-icon name="work" color="primary" size="28px" class="q-mr-sm" />
                Work Experience
              </div>
              <div class="q-gutter-md row items-start">
                <q-select
                  outlined
                  dense
                  label="Total Years of Experience *"
                  v-model="form.experience.totalYears"
                  :options="experienceYears"
                  class="col-12 col-md-6 input-field"
                  :rules="[val => !!val || 'Experience is required']"
                  aria-required="true"
                />
                <q-input
                  outlined
                  dense
                  label="Last Job Title"
                  v-model="form.experience.jobTitle"
                  class="col-12 col-md-6 input-field"
                  aria-label="Last job title"
                />
                <q-input
                  outlined
                  dense
                  label="Last Company Name"
                  v-model="form.experience.companyName"
                  class="col-12 col-md-6 input-field"
                  aria-label="Last company name"
                />
                <q-input
                  outlined
                  dense
                  type="textarea"
                  label="Responsibilities / Achievements"
                  v-model="form.experience.responsibilities"
                  class="col-12 input-field"
                  rows="4"
                  aria-label="Responsibilities or achievements"
                />
                <q-select
                  outlined
                  dense
                  label="Notice Period"
                  v-model="form.experience.noticePeriod"
                  :options="noticePeriods"
                  class="col-12 col-md-6 input-field"
                  aria-label="Notice period"
                />
                <q-input
                  outlined
                  dense
                  label="Current Salary"
                  type="number"
                  prefix="$"
                  v-model="form.experience.currentSalary"
                  class="col-12 col-md-3 input-field short-field"
                  aria-label="Current salary"
                />
                <q-input
                  outlined
                  dense
                  label="Expected Salary"
                  type="number"
                  prefix="$"
                  v-model="form.experience.expectedSalary"
                  class="col-12 col-md-3 input-field short-field"
                  aria-label="Expected salary"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Skills & Certifications -->
          <q-card class="card-style q-mb-lg">
            <q-card-section class="q-pa-lg">
              <div class="section-title q-mb-md">
                <q-icon name="workspace_premium" color="primary" size="28px" class="q-mr-sm" />
                Skills & Certifications
              </div>
              <div class="q-gutter-md">
                <q-input
                  outlined
                  dense
                  label="Key Skills (comma separated)"
                  v-model="form.skills"
                  placeholder="E.g. JavaScript, Vue, Node.js"
                  class="input-field"
                  aria-label="Key skills"
                />
                <q-input
                  outlined
                  dense
                  type="textarea"
                  label="Certifications"
                  v-model="form.certifications"
                  placeholder="List your certifications, courses, or qualifications..."
                  class="input-field"
                  rows="4"
                  aria-label="Certifications"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Availability -->
          <q-card class="card-style q-mb-lg">
            <q-card-section class="q-pa-lg">
              <div class="section-title q-mb-md">
                <q-icon name="event" color="primary" size="28px" class="q-mr-sm" />
                Availability
              </div>
              <div class="q-gutter-md row items-start">
                <q-input
                  outlined
                  dense
                  label="Preferred Interview Time Slot"
                  type="datetime-local"
                  v-model="form.availability.interviewTime"
                  class="col-12 col-md-6 input-field"
                  aria-label="Preferred interview time"
                />
                <q-input
                  outlined
                  dense
                  label="Earliest Joining Date"
                  type="date"
                  v-model="form.availability.joiningDate"
                  class="col-12 col-md-6 input-field short-field"
                  aria-label="Earliest joining date"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Additional Questions -->
          <q-card class="card-style q-mb-lg">
            <q-card-section class="q-pa-lg">
              <div class="section-title q-mb-md">
                <q-icon name="quiz" color="primary" size="28px" class="q-mr-sm" />
                Additional Questions
              </div>
              <div class="q-gutter-md column">
                <q-input
                  outlined
                  dense
                  type="textarea"
                  label="Why are you interested in this role? *"
                  v-model="form.additional.whyInterested"
                  class="input-field"
                  :rules="[val => !!val || 'This field is required']"
                  rows="4"
                  aria-required="true"
                />
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <div class="text-subtitle1 q-mb-sm">Are you willing to relocate? *</div>
                    <q-field
                      v-model="form.additional.relocate"
                      :rules="[val => val !== null || 'Please select an option']"
                      borderless
                      aria-required="true"
                    >
                      <q-option-group
                        v-model="form.additional.relocate"
                        :options="yesNoOptions"
                        type="radio"
                        inline
                      />
                    </q-field>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="text-subtitle1 q-mb-sm">Do you have the legal right to work in this country? *</div>
                    <q-field
                      v-model="form.additional.legalRight"
                      :rules="[val => val !== null || 'Please select an option']"
                      borderless
                      aria-required="true"
                    >
                      <q-option-group
                        v-model="form.additional.legalRight"
                        :options="yesNoOptions"
                        type="radio"
                        inline
                      />
                    </q-field>
                  </div>
                </div>
                <q-select
                  outlined
                  dense
                  label="How did you hear about this job?"
                  v-model="form.additional.source"
                  :options="sources"
                  class="input-field"
                  aria-label="Source of job discovery"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Resume Upload -->
          <q-card class="card-style q-mb-lg">
            <q-card-section class="q-pa-lg">
              <div class="section-title q-mb-md">
                <q-icon name="description" color="primary" size="28px" class="q-mr-sm" />
                Resume & Cover Letter
              </div>
              <div class="q-mb-md">
                <p class="q-mb-xs text-subtitle1">Upload Resume *</p>
                <q-uploader
                  url=""
                  label="Drag and drop your resume or click to browse"
                  accept=".pdf,.doc,.docx"
                  :auto-upload="false"
                  ref="resumeUploader"
                  max-file-size="5242880"
                  :hide-upload-btn="true"
                  class="uploader-style"
                  aria-required="true"
                  :error="resumeError"
                  error-message="Resume is required"
                  @added="onResumeAdded"
                />
                <small class="text-grey-7">PDF, DOC, DOCX files only. Max 5MB.</small>
              </div>
              <div>
                <p class="q-mb-xs text-subtitle1">Upload Cover Letter (Optional)</p>
                <q-uploader
                  url=""
                  label="Drag and drop your cover letter or click to browse"
                  accept=".pdf,.doc,.docx"
                  :auto-upload="false"
                  ref="coverUploader"
                  max-file-size="5242880"
                  :hide-upload-btn="true"
                  class="uploader-style"
                  aria-label="Upload cover letter"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Agreement Checkbox -->
          <div class="q-mb-md q-pa-md bg-grey-1 rounded-borders">
            <q-checkbox
              v-model="form.agree"
              :rules="[val => !!val || 'You must agree before submitting']"
              aria-required="true"
            >
              <span>
                I agree to the
                <a href="/terms" target="_blank" class="text-primary">Terms & Conditions</a>
                and
                <a href="/privacy" target="_blank" class="text-primary">Privacy Policy</a>.
                I confirm that all information provided is accurate and complete.
              </span>
            </q-checkbox>
          </div>

          <!-- Submit Button -->
          <q-btn
            label="Submit Application"
            type="submit"
            color="primary"
            class="q-mt-lg full-width submit-btn"
            :loading="loading"
            :disable="loading"
            aria-label="Submit application"
          >
            <template v-slot:loading>
              <q-spinner-oval class="on-left" />
              Submitting...
            </template>
          </q-btn>
        </q-form>
      </div>
    </q-page>
  </div>
</template>

<script>
import AppHeader from '../components/HeaderPart.vue';
import axios from 'axios';

export default {
  name: 'ApplicationForm',
  components: { AppHeader },
  props: ['jobId'],
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: '',
        skills: '',
        certifications: '',
        education: { qualification: '', passingYear: '', institution: '', cgpa: '' },
        experience: {
          totalYears: '',
          jobTitle: '',
          companyName: '',
          responsibilities: '',
          noticePeriod: '',
          currentSalary: '',
          expectedSalary: ''
        },
        availability: { interviewTime: '', joiningDate: '' },
        additional: { whyInterested: '', relocate: null, legalRight: null, source: '' },
        agree: false
      },
      qualifications: ['High School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'Ph.D.'],
      experienceYears: ['Fresher', '1 Year', '2 Years', '3 Years', '4 Years', '5+ Years'],
      noticePeriods: ['Immediate', '15 Days', '1 Month', '2 Months', '3 Months'],
      yesNoOptions: [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
      ],
      sources: ['LinkedIn', 'Company Website', 'Job Portal', 'Social Media', 'Referral', 'Other'],
      loading: false,
      resumeError: false
    };
  },
  mounted() {
    console.log('Applying for Job ID:', this.jobId);
  },
  methods: {
    onResumeAdded(files) {
      // Reset error when a file is added
      this.resumeError = false;
      console.log('Resume files added:', files);
    },
    async submitForm() {
      console.log('submitForm called');
      this.resumeError = false;
      this.loading = true;
      try {

        if (!this.form.agree) {
          this.$q.notify({
            type: 'negative',
            message: 'You must agree to Terms & Conditions before submitting.'
          });
          this.loading = false;
          return;
        }
        // Basic required fields check
        if (
          !this.form.firstName ||
          !this.form.lastName ||
          !this.form.email ||
          !this.form.phone ||
          !this.form.additional.whyInterested ||
          !this.$refs.resumeUploader.files.length
        ) {
          this.$q.notify({ type: 'negative', message: 'Please fill out all required fields.' });
          this.loading = false;
          return;
        }

        const token = localStorage.getItem('authToken');
        const formData = new FormData();

        // Append mandatory fields
        formData.append('job_id', this.jobId);
        formData.append('cover_letter', this.form.additional.whyInterested);

        // Append resume file
        const resumeFile = this.$refs.resumeUploader.files[0];
        formData.append('resume', resumeFile);

        // You can append other optional form fields here as needed, example:
        // formData.append('firstName', this.form.firstName);
        // formData.append('lastName', this.form.lastName);
        // etc...

        const res = await axios.post('http://localhost:3000/api/applications/apply', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (res.data.success) {
          this.$q.notify({ type: 'positive', message: 'Application submitted successfully!' });
          this.$router.push('/dashboard');
        } else {
          throw new Error(res.data.message || 'Submission failed');
        }
      } catch (error) {
        console.error('Submission error:', error);
        this.$q.notify({ type: 'negative', message: 'Error submitting application. Please try again.' });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.application-form-page {
  background: linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%);
  min-height: 100vh;
}

.q-page {
  max-width: 1200px;
  margin: auto;
}

.container {
  padding: 2rem;
}

.page-header {
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  text-align: center;
}

.card-style {
  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff, #f9fafb);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease-in-out;
}

.card-style:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1565c0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.input-field {
  max-width: 400px;
  width: 100%;
}

.input-field.short-field {
  max-width: 200px;
}

.input-field .q-field__control,
.input-field .q-select__control {
  border-radius: 8px;
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease-in-out;
}

.input-field .q-field__control:hover,
.input-field .q-select__control:hover {
  border-color: #2563eb;
  background-color: #ffffff;
}

.input-field.q-field--focused .q-field__control,
.input-field.q-field--highlighted .q-field__control,
.input-field.q-field--focused .q-select__control,
.input-field.q-field--highlighted .q-select__control {
  border-color: #2563eb;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-field.q-field--error .q-field__control,
.input-field.q-field--error .q-select__control {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.input-field.q-input--textarea .q-field__control {
  width: 100%;
  min-height: 120px;
  height: 120px;
  resize: vertical;
  padding: 0.5rem;
}

.uploader-style {
  border-radius: 8px;
  background-color: #f9fafb;
  border: 2px dashed #d1d5db;
  transition: border-color 0.2s ease-in-out;
  max-width: 600px;
  width: 100%;
}

.uploader-style:hover {
  border-color: #2563eb;
}

.submit-btn {
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(90deg, #1565c0, #1e40af);
  color: white;
  transition: all 0.3s ease-in-out;
  max-width: 400px;
  margin: 0 auto;
}

.submit-btn:hover {
  background: linear-gradient(90deg, #1e40af, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.text-h4 {
  color: #1565c0;
  font-weight: 700;
  font-size: 2rem;
}

.text-subtitle1 {
  color: #4b5563;
  font-size: 1.1rem;
}

small {
  color: #6b7280;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .page-header {
    text-align: left;
  }

  .card-style {
    margin-bottom: 1rem;
  }

  .input-field {
    max-width: 100%;
  }

  .input-field.short-field {
    max-width: 150px;
  }

  .input-field.q-input--textarea .q-field__control {
    min-height: 100px;
    height: 100px;
  }

  .uploader-style {
    max-width: 100%;
  }

  .submit-btn {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    max-width: 100%;
  }
}

.input-field[aria-required="true"] .q-field__label::after,
.q-select[aria-required="true"] .q-field__label::after,
.q-field[aria-required="true"] .q-field__label::after {
  content: ' *';
  color: #ef4444;
}
</style>
