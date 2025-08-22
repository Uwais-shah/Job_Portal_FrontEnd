<!-- src/pages/HomePage.vue -->
<template>
  <div class="landing-page">
    <AppHeader />

    <section class="hero">
      <div class="hero-background-strip"></div>
      
      <h1 class="tagline" style="color: #2a2a2a; text-shadow: 0 0 5px rgba(45, 108, 255, 0.442), 0 0 6px rgba(45, 108, 255, 0.442), 0 0 8px rgba(45, 108, 255, 0.442);">Your Dream Job is Just a Click Away <br/><span class="handwritten">Explore. Apply. Succeed.</span></h1>
      <p>
        Unlock your next big opportunity - thousands of jobs, zero stress. Start your career adventure with JobHub today!
      </p>

      <div class="search-box">
        <input type="text" placeholder="🔍 Job title or keyword" v-model="searchInput" />
        <input type="text" placeholder="📍 City, state, or remote" v-model="locationInput" />
        <button @click="performSearch">Search Jobs</button>
      </div>

      <div class="hero-stats" ref="heroStats">
        <div><strong ref="statJobs">0</strong> Active Jobs</div>
        <div><strong ref="statCompanies">0</strong> Companies</div>
        <div><strong ref="statSeekers">0</strong> Job Seekers</div>
      </div>
    </section>
   
    <section v-if="isLoggedIn">
      <JobListingPage :searchQuery="searchInput" :location="locationInput" />
    </section>

    <section v-if="isLoggedIn && !isEmployer">
      <SuggestedSkills />
    </section>

    <div v-else class="login-prompt">
      <p>
        <q-icon name="lock" size="1.2em" class="q-mr-sm" />
        Please <router-link to="/login">log in</router-link> to get personalized job suggestions.
      </p>
    </div>

    <section v-if="!isEmployer" class="categories">
      <h2>Browse Jobs by <span>Category</span></h2>
      <p>
        Explore opportunities across various industries and find the perfect role that
        matches your skills and interests.
      </p>

      <div class="category-grid">
        <q-card class="category-card cursor-pointer" @click="gotoCategory('Technology')">
          <div class="icon">💻</div>
          <h3>Information Technology</h3>
          <p class="count">12,500+ jobs</p>
          <small>Software, Web Development, Data Science</small>
        </q-card>
        <q-card class="category-card cursor-pointer" @click="gotoCategory('Marketing')">
          <div class="icon">📈</div>
          <h3>Marketing & Sales</h3>
          <p class="count">8,300+ jobs</p>
          <small>Digital Marketing, Sales, Business Development</small>
        </q-card>
        <q-card class="category-card cursor-pointer" @click="gotoCategory('Finance')">
          <div class="icon">💰</div>
          <h3>Finance & Accounting</h3>
          <p class="count">6,700+ jobs</p>
          <small>Accounting, Financial Analysis, Investment</small>
        </q-card>
        <q-card class="category-card cursor-pointer" @click="gotoCategory('HR')">
          <div class="icon">👥</div>
          <h3>Human Resources</h3>
          <p class="count">4,200+ jobs</p>
          <small>HR Management, Recruitment, Training</small>
        </q-card>
        <q-card class="category-card cursor-pointer" @click="gotoCategory('Business')">
          <div class="icon">📦</div>
          <h3>Business & Consulting</h3>
          <p class="count">3,800+ jobs</p>
          <small>Strategy, Operations, Management</small>
        </q-card>
        <q-card class="category-card cursor-pointer" @click="gotoCategory('Design')">
          <div class="icon">🎨</div>
          <h3>Design & Creative</h3>
          <p class="count">2,900+ jobs</p>
          <small>UI/UX, Graphics, Content Creation</small>
        </q-card>
        <q-card class="category-card cursor-pointer" @click="gotoCategory('Legal')">
          <div class="icon">🛡️</div>
          <h3>Legal & Compliance</h3>
          <p class="count">1,500+ jobs</p>
          <small>Legal Affairs, Compliance, Risk</small>
        </q-card>
        <q-card class="category-card cursor-pointer" @click="gotoCategory('Healthcare')">
          <div class="icon">⚕️</div>
          <h3>Healthcare & Medical</h3>
          <p class="count">5,200+ jobs</p>
          <small>Medical, Nursing, Healthcare Admin</small>
        </q-card>
      </div>
    </section>

    <section v-if="!isLoggedIn" class="how-it-works">
      <h2>How It Works</h2>
      <p class="subtitle">
        Get started with your job search in three simple steps. Our streamlined process<br />
        makes finding your next opportunity easier than ever.
      </p>

      <div class="steps">
        <div class="step">
          <div class="step-icon blue">👤➕</div>
          <div class="step-number">1</div>
          <h3>Create Profile</h3>
          <p>Sign up and build your professional profile with your skills, experience, and preferences.</p>
        </div>

        <div class="step">
          <div class="step-icon green">🔍</div>
          <div class="step-number">2</div>
          <h3>Search & Apply</h3>
          <p>Browse through thousands of jobs, filter by your preferences, and apply with one click.</p>
        </div>

        <div class="step">
          <div class="step-icon purple">✅</div>
          <div class="step-number">3</div>
          <h3>Get Hired</h3>
          <p>Connect with employers, attend interviews, and land your dream job with our support.</p>
        </div>
      </div>

      <div class="features">
        <div class="feature-item">
          <strong>Quick Setup</strong>
          <small>Create your profile in under 5 minutes</small>
        </div>
        <div class="feature-item">
          <strong>Smart Matching</strong>
          <small>AI-powered job recommendations</small>
        </div>
        <div class="feature-item">
          <strong>24/7 Support</strong>
          <small>Get help whenever you need it</small>
        </div>
      </div>
    </section>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../components/HeaderPart.vue';
import AppFooter from '../components/FooterPart.vue';
import JobListingPage from './JobListing.vue';
import SuggestedSkills from '../components/SuggestedSkills.vue';
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { storeToRefs } from 'pinia';

export default {
  name: 'HomePage',
  components: {
    AppHeader,
    AppFooter,
    JobListingPage,
    SuggestedSkills
  },
  setup() {
    const router = useRouter();
    const searchInput = ref('');
    const locationInput = ref('');
    const authStore = useAuthStore();
    const { isAuthenticated } = storeToRefs(authStore);
    const isLoggedIn = computed(() => !!authStore.userData);
    const isEmployer = computed(() => authStore.userData?.role === 'company');

    // Template refs for animation
    const heroStats = ref(null);
    const statJobs = ref(null);
    const statCompanies = ref(null);
    const statSeekers = ref(null);

    // Animation logic for the counters
    function animateCount(refVar, target, duration = 2000) {
      if (!refVar.value) return;
      const start = 0;
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = Math.floor(progress * (target - start) + start);
        refVar.value.innerText = currentVal.toLocaleString();
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }

    function initIntersectionObserver() {
      const options = {
        root: null,
        threshold: 0.5
      };

      const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Call animateCount for each stat
            animateCount(statJobs, 50000);
            animateCount(statCompanies, 15000);
            animateCount(statSeekers, 2000000);
            
            // Stop observing after the animation has run once
            observerInstance.unobserve(entry.target);
          }
        });
      }, options);

      if (heroStats.value) {
        observer.observe(heroStats.value);
      }
    }

    function gotoCategory(category) {
      router.push({ name: 'JobListing', params: { category } });
    }

    function performSearch() {
      const searchQuery = searchInput.value.trim();
      const locationQuery = locationInput.value.trim();
      
      if (searchQuery || locationQuery) {
        router.push({
          name: 'JobListing',
          query: {
            search: searchQuery,
            location: locationQuery
          }
        });
      }
    }

    onMounted(() => {
      authStore.initialize();
      initIntersectionObserver();
    });

    return {
      gotoCategory,
      isAuthenticated,
      searchInput,
      locationInput,
      performSearch,
      isLoggedIn,
      isEmployer,
      heroStats,
      statJobs,
      statCompanies,
      statSeekers
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Satisfy&display=swap');

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1000;
}

@keyframes breathe {
  0%   { background-color: #e1f5fe; }
  20%  { background-color: #e0f2f1; }
  40%  { background-color: #fffde7; }
  60%  { background-color: #f3e5f5; }
  80%  { background-color: #e3f2fd; }
  100% { background-color: #e1f5fe; }
}

@keyframes hover-breathe {
  0%   { background-color: #e3f2fd; }
  25%  { background-color: #fff3f7ff; }
  50%  { background-color: #fbf4e8ff; }
  75%  { background-color: #fffde7; }
  100% { background-color: #e3f2fd; }
}

@keyframes sea-breathe {
  0%   { background-color: #e0f7fa; }
  50%  { background-color: #e0f2f1; }
  100% { background-color: #e0f7fa; }
}

@keyframes animated-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes textGlow {
  0%, 100% {
    text-shadow: 0 0 5px rgba(45, 108, 255, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(45, 108, 255, 0.8), 0 0 30px rgba(45, 108, 255, 0.6);
  }
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background-image: url('src/assets/bghome2.jpeg');
  background-size: cover;
  background-position: center;
  filter: blur(5px);
  -webkit-mask-image: 
    linear-gradient(to right, 
      black 15%, transparent 45%, transparent 55%, black 85%
    ),
    linear-gradient(to bottom,
      black 85%, 
      transparent 100%
    );
  mask-image: 
    linear-gradient(to right, 
      black 15%, transparent 45%, transparent 55%, black 85%
    ),
    linear-gradient(to bottom,
      black 85%, 
      transparent 100%
    );
}

.hero-background-strip {
  position: absolute;
  top: 50%;
  left: -10%;
  right: -10%;
  height: 450px;
  transform: translateY(-50%) rotate(-2deg);
  z-index: 0;
  background: linear-gradient(-45deg, #c8e4f9, #b9d4ff, #baf7fe, #9dd3ff);
  background-size: 400% 400%;
  animation: animated-gradient 15s ease infinite;
  filter: blur(20px);
  opacity: 0.7;
}

.hero h1,
.hero p,
.hero .search-box,
.hero .hero-stats {
  position: relative;
  z-index: 1;
}

.landing-page {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #2a2a2a;
  animation: breathe 18s ease-in-out infinite;
  line-height: 1.6;
}

.navbar {
  display: flex;
  justify-content: space-between;
  padding: 20px 60px;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #eaecef;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.logo {
  font-weight: 700;
  color: #1565c0;
  font-size: 24px;
}

.nav-links a {
  margin: 0 20px;
  color: #333;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.nav-links a:hover {
  color: #1565c0;
}

.auth-buttons .sign-in {
  margin-right: 15px;
  font-weight: 600;
  color: #333;
  text-decoration: none;
}
.auth-buttons .sign-in:hover {
  color: #1565c0;
}

.auth-buttons .sign-up {
  background-color: #1565c0;
  color: white;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.3s;
}
.auth-buttons .sign-up:hover {
  background-color: #1c4fcf;
}

.section-divider {
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(21, 101, 192, 0.2), rgba(0, 0, 0, 0));
  margin: 20px auto;
}

.handwritten {
  font-family: 'Satisfy', cursive;
  font-size: 30px;
  color: #1565c0;
  display: inline-block;
  margin-top: 10px;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
  opacity: 0;
  transform: scale(.8);
  animation: zoomIn .6s ease-out forwards, textGlow 4s infinite ease-in-out;
  animation-delay: .2s, 0s;
}

.hero {
  text-align: center;
  padding: 90px 20px 70px;
  position: relative; 
  overflow: hidden;   
}
.hero h1 {
  font-size: 44px;
  font-weight: 700;
}
.hero h1 span {
  color: #1565c0;
}
.hero p {
  margin-top: 20px;
  color: #555;
  font-size: 18px;
}
.hero-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  font-size: 16px;
  margin: 60px auto 0;
  padding: 20px;
  max-width: 800px;
  background-color: transparent;
  backdrop-filter: blur(4px);
}
.hero-stats > div {
  position: relative;
  padding: 0 30px;
  text-align: center;
}
.hero-stats > div:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 40px;
  background-color: #dbe4f0;
}
.hero-stats strong {
  display: block;
  font-size: 28px;
  color: #1565c0; 
}

.search-box {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 0; 
  flex-wrap: wrap;
  background: #fff;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(21, 101, 192, 0.15);
  max-width: 850px;
  margin-left: auto;
  margin-right: auto;
}
.search-box input {
  padding: 14px 20px;
  border: none; 
  border-radius: 0;
  width: 260px;
  font-size: 15px;
  border-right: 1px solid #eee; 
}
.search-box input:last-of-type {
  border-right: none;
}
.search-box button {
  background-color: #1565c0;
  color: white;
  padding: 14px 24px;
  border: none;
  border-radius: 8px; 
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 10px;
}
.search-box button:hover {
  background-color: #1c4fcf;
  transform: scale(1.05);
}

.search-box input:hover {
  border-color: #1565c0;
  box-shadow: 0 0 0 2px rgba(21, 101, 192, 0.2);
  transition: all 0.3s ease;
}

.login-prompt {
  text-align: center;
  font-size: 25px;
  font-family: monospace;
  padding: 30px 20px;
  background-color: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin: 40px auto;
  max-width: 800px;
  color: #555;
  transition: background-color 0.4s ease;
}

.login-prompt:hover {
  animation: sea-breathe 8s ease-in-out infinite;
}

.login-prompt a {
  color: #1565c0;
  font-weight: 600;
  text-decoration: none;
}

.login-prompt a:hover {
  text-decoration: underline;
}

.categories {
  text-align: center;
  font-family: Lucida Bright;
  padding: 30px 30px 70px;
  background-color: transparent;
  border-radius: 20px;
  transition: background-color 0.5s ease;
}
.categories h2 {
  font-size: 40px;
  font-family: MV Boli;
  font-weight: 700;
  margin-bottom: 12px;
}
.categories h2 span {
  color: #1565c0;
}
.categories p {
  font-size: 20px;
  font-family: Rockwell;
  color: #666;
}
.category-grid {
  display: flex; 
  flex-wrap: wrap;        
  justify-content: center;
  gap: 32px;
  margin-top: 20px;
}
.category-card {
  background: white;
  border-radius: 16px;
  padding: 32px 22px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  text-align: center;
  font-style: bold;
  min-width: 260px;
  max-width: 300px;
  min-height: 330px;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.category-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #1565c0;
}
.category-card .icon {
  font-size: 30px;
  margin-bottom: 14px;
}
.category-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d2b53;
  margin-bottom: 6px;
}
.category-card .count {
  color: #1565c0;
  font-weight: 700;
}
.category-card small {
  color: #888;
  font-size: 13px;
}

.how-it-works {
  padding: 80px 30px;
  text-align: center;
  background-color: transparent;
  border-radius: 20px;
  transition: background-color 0.5s ease;
}
.how-it-works h2 {
  font-size: 40px;
  font-family: MV Boli;
  color: #1565c0;
  margin-bottom: 10px;
}
.how-it-works .subtitle {
  font-size: 20px;
  font-style: bold;
  font-family: Geneva;
  color: #666;
  margin-bottom: 50px;
}

.categories:hover,
.how-it-works:hover {
  animation: hover-breathe 15s ease-in-out infinite;
}

.steps {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 50px;
}
.step {
  background: #fff;
  border-radius: 14px;
  padding: 30px 25px;
  max-width: 300px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  text-align: center;
}
.step:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(21, 101, 192, 0.1);
  transition: all 0.3s ease;
}
.step-icon {
  font-size: 36px;
  margin-bottom: 12px;
  display: inline-block;
  padding: 20px;
  border-radius: 50%;
  color: white;
}
.step-number {
  background-color: #1565c0;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  line-height: 28px;
  margin: 12px auto;
}
.step h3 {
  font-size: 18px;
  margin: 12px 0;
}
.step p {
  font-size: 14px;
  color: #555;
}

.tagline {
  opacity: 0;
  transform: scale(0.8);
  animation: zoomIn 0.6s ease-out forwards;
  animation-delay: 0.2s;
}

@keyframes zoomIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.features {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  text-align: center;
  gap: 80px;
  margin-top: 40px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 200px;
}

.feature-item:hover {
  transform: translateY(-4px);
  transition: all 0.3s ease;
  background-color: #f4f8ff;
  border-radius: 10px;
  padding: 10px;
}

.feature-item strong {
  color: #1565c0;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.feature-item small {
  color: #555;
  font-size: 0.9rem;
  line-height: 1.3;
}

.footer {
  background: #1565c0;
  color: white;
  padding: 60px 40px 20px;
  margin-top: 80px;
}

.footer-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 40px;
}

.footer-brand {
  max-width: 300px;
}
.footer-logo {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}
.footer-brand p {
  font-size: 14px;
  line-height: 1.6;
  color: #e0e0e0;
}
.social-icons {
  margin-top: 15px;
}
.social-icons a {
  margin-right: 10px;
  color: white;
  font-size: 16px;
  transition: color 0.2s ease;
}
.social-icons a:hover {
  color: #cfd8ff;
}

.footer-links {
  display: flex;
  gap: 50px;
  flex-wrap: wrap;
}
.footer-links h4 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}
.footer-links a {
  display: block;
  margin-bottom: 8px;
  color: #e0e0e0;
  font-size: 14px;
  text-decoration: none;
}
.footer-links a:hover {
  color: white;
}

.footer-bottom {
  text-align: center;
  font-size: 13px;
  padding-top: 20px;
  color: #cbdfff;
}

.nav-links .active-link {
  position: relative;
  color: #1565c0;
  font-weight: 700;
  transition: color 0.3s ease;
}

.nav-links .active-link::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #1565c0;
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  0% {
    width: 0;
    opacity: 0;
  }
  100% {
    width: 100%;
    opacity: 1;
  }
}

.nav-link {
  position: relative;
  font-weight: 500;
  color: white;
  text-transform: none;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: white;
  transition: width 0.3s ease-in-out;
}

.nav-link:hover::after,
.nav-link.router-link-exact-active::after {
  width: 100%;
}
</style>