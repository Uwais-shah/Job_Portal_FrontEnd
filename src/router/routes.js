import HomePage from 'pages/HomePage.vue'
const AboutUs = () => import('pages/AboutUs.vue')

const routes = [
  // --- PUBLIC-FACING ROUTES (using MainLayout.vue) ---
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'Home', component: HomePage },
      { path: 'employers', name: 'Employers', component: () => import('pages/EmployerHomePage.vue') },
      { path: 'about', name: 'About', component: AboutUs },
      { path: 'contact', name: 'Contact', component: () => import('pages/ContactPage.vue') },
      { path: 'privacy-policy', name: 'PrivacyPolicy', component: () => import('pages/PrivacyPolicy.vue') },
      { path: '/terms-and-conditions', name: 'TermsConditions', component: () => import('pages/TermsConditions.vue') },
      { path: 'job/:id', name: 'JobDescription', component: () => import('pages/JobDescriptionPage.vue'), props: true },
      { path: 'jobs/:category', name: 'JobListing', component: () => import('pages/JobListing.vue'), props: true },
      { path: 'apply/:jobId', name: 'ApplicationForm', component: () => import('pages/ApplicationForm.vue'), props: true },
      { path: 'application/:applicationId', name: 'ApplicationDetails', component: () => import('../components/ApplicationDetailsPage.vue'), props: true },
      { path: '/resume-builder', component: () => import('../components/resume-builder.vue') },
      { path: '/dashboard', name: 'JobSeekerDashboard', component: () => import('pages/JobSeekerDashboard.vue'), meta: { requiresAuth: true, role: 'job_seeker' } },


      { path: '/application-success', name: 'ApplicationSuccess', component: () => import('pages/ApplicationSuccess.vue') },
      { path: '/test-instructions', name: 'TestInstructions', component: () => import('../pages/TestInstructions.vue') },
      { path: '/test', name: 'TestPage', component: () => import('../pages/TestPage.vue') },
      { path: '/test-under-review', name: 'TestUnderReview', component: () => import('../components/TestUnderReview.vue') },
      { path: "/application-status", name: "ApplicationStatus", component: () => import('../pages/ApplicationStatus.vue') },
    ]
  },

  // --- AUTHENTICATION ROUTES (using AuthLayout.vue or standalone) ---
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'Login', component: () => import('pages/LoginPage.vue') },
    ]
  },
  {
    path: '/create-account',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'CreateAccount', component: () => import('pages/CreateAccount.vue') }
    ]
  },
  {
    path: '/forgot-password',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'ForgotPassword', component: () => import('pages/ChangePassword.vue') }
    ]
  },

  // --- EMPLOYER PORTAL ROUTES (standalone pages) ---
  {
    path: '/employer-signup',
    name: 'EmployerSignUp',
    component: () => import('src/pages/EmployerSignUp.vue')
  },
  {
    path: '/registration-pending',
    name: 'RegistrationPending',
    component: () => import('pages/RegistrationPending.vue')
  },
  {
    path: '/employer-portal',
    name: 'EmployerPortal',
    component: () => import('pages/EmployerPortal.vue'),
    meta: { requiresAuth: true, role: 'company' }
  },
  {
    path: '/posted-jobs',
    name: 'PostedJobs',
    component: () => import('components/PostedJobs.vue'),
    meta: { requiresAuth: true, role: 'company' }
  },
  {
    path: '/post-job',
    name: 'PostNewJob',
    component: () => import('components/PostNewJob.vue'),
    meta: { requiresAuth: true, role: 'company' }
  },
  {
    path: '/candidates',
    name: 'EmployerCandidates',
    component: () => import('components/EmployerCandidates.vue'),
    meta: { requiresAuth: true, role: 'company' }
  },
  {
    path: '/employer-messages',
    name: 'EmployerMessages',
    component: () => import('components/EmployerMessages.vue'),
    meta: { requiresAuth: true, role: 'company' }
  },
  {
    path: '/company-profile',
    name: 'CompanyProfile',
    component: () => import('components/CompanyProfile.vue'),
    meta: { requiresAuth: true, role: 'company' }
  },
  {
    path: '/employer-settings',
    name: 'EmployerSettings',
    component: () => import('components/EmployerSettings.vue'),
    meta: { requiresAuth: true, role: 'company' }
  },
  {
    path: '/view-tests',
    name: 'ViewTests',
    component: () => import('components/ViewTests.vue'),
    meta: { requiresAuth: true, role: 'company' }
  },
  {
    path: '/screening-test/:testId?',
    name: 'ScreeningTest',
    component: () => import('components/ScreeningTest.vue'),
    meta: { requiresAuth: true, role: 'company' }
  },


  // --- ADMIN ROUTES ---
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('pages/admin/AdminLogin.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('pages/admin/AdminDashboard.vue') },
      { path: 'companies', name: 'CompaniesManagement', component: () => import('pages/admin/CompaniesManagement.vue') },
      { path: 'users', name: 'UserManagement', component: () => import('pages/admin/UserManagement.vue') },
      { path: 'queries', name: 'AdminQueries', component: () => import('pages/admin/ChatsQueries.vue') }
    ]
  },

  // --- 404 NOT FOUND (Keep this last) ---
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes;
