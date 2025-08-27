<template>
  <div class="login-bg-image flex flex-center">
    <q-card class="glass-card q-pa-lg">
      <div class="row items-center q-mb-lg cursor-pointer interactive-link" @click="goBack">
        <q-icon name="arrow_back" size="20px" class="q-mr-sm" />
        <span class="text-weight-medium">Back to Home</span>
      </div>

      <div class="q-mb-lg text-center">
        <q-avatar size="72px" class="bg-primary text-white q-mb-sm">
          <q-icon name="admin_panel_settings" size="38px" />
        </q-avatar>
        <div class="text-h5 text-weight-bold text-dark dark:text-white">Admin Portal</div>
        <div class="text-subtitle2 text-grey-8 dark:text-grey-3">Sign in to manage JobHub</div>
      </div>

      <q-banner
        v-if="errorMessage"
        inline-actions
        class="bg-red-1 text-red q-mb-md"
        rounded
      >
        {{ errorMessage }}
        <template v-slot:action>
          <q-btn flat round color="red" icon="close" @click="errorMessage = ''" />
        </template>
      </q-banner>

      <q-form @submit.prevent="handleLogin" class="q-gutter-y-md">
        <q-input
          v-model="email"
          label="Email Address"
          type="email"
          outlined
          :dark="$q.dark.isActive"
          :rules="[val => !!val || 'Email is required']"
          lazy-rules
          :disable="loading"
        >
          <template v-slot:prepend>
            <q-icon name="alternate_email" />
          </template>
        </q-input>

        <q-input
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          outlined
          :dark="$q.dark.isActive"
          :rules="[val => !!val || 'Password is required']"
          lazy-rules
          :disable="loading"
        >
          <template v-slot:prepend>
            <q-icon name="lock_outline" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <div class="row justify-between items-center q-mb-sm">
          <q-checkbox v-model="rememberMe" label="Remember me" dense />
          <q-btn
            flat
            label="Forgot Password?"
            class="q-pa-none text-caption text-weight-medium interactive-link"
            no-caps
            :disable="loading"
            @click="onForgotPassword"
          />
        </div>

        <q-btn
          type="submit"
          color="primary"
          label="Sign In"
          class="full-width q-mt-md"
          size="lg"
          unelevated
          rounded
          glossy
          :loading="loading"
          :disable="!email || !password"
        >
           <template v-slot:loading>
            <q-spinner-oval class="on-left" />
            Authenticating...
          </template>
        </q-btn>
      </q-form>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import adminService from 'src/services/admin.service';
import { api } from 'src/boot/axios';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const rememberMe = ref(false);

onMounted(() => {
  if (route.query.sessionExpired === 'true') {
    errorMessage.value = 'Your session has expired. Please log in again.';
  } else if (route.query.error === 'session_verification_failed') {
    errorMessage.value = 'Session verification failed. Please log in again.';
  }
});

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    console.log('Attempting login with:', { email: email.value });
    
    // Clear any existing tokens and auth data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiry');
    delete api.defaults.headers.common['Authorization'];
    
    // Call the login service
    const result = await adminService.login({
      email: email.value.trim(),
      password: password.value
    });

    console.log('Login result:', result);

    if (result.success && result.token) {
      console.log('Login successful, processing response');
      
      const { token, admin, redirectTo } = result;
      
      // Store the token in localStorage
      localStorage.setItem('adminToken', token);
      
      // Set axios default headers for subsequent requests
      api.defaults.headers.common['Authorization'] = token;
      
      // Set remember me if needed
      if (rememberMe.value) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        localStorage.setItem('adminTokenExpiry', expiryDate.getTime().toString());
      }

      // Store admin data if available
      if (admin) {
        localStorage.setItem('adminData', JSON.stringify(admin));
      }
      
      // Get the redirect path
      const redirectPath = redirectTo || '/admin/dashboard';
      console.log('Login successful, redirecting to:', redirectPath);
      
      // Use router.push for SPA navigation instead of full page reload
      await router.push(redirectPath);
      
      // Show success notification
      $q.notify({
        type: 'positive',
        message: 'Successfully logged in!',
        position: 'top'
      });
      
    } else {
      // Handle login failure
      const errorMsg = result.error || 'Login failed. Please check your credentials and try again.';
      console.error('Login failed:', errorMsg);
      errorMessage.value = errorMsg;
      
      // Clear any existing auth data on failed login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminTokenExpiry');
      localStorage.removeItem('adminData');
      delete api.defaults.headers.common['Authorization'];
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = 'An error occurred during login. Please try again.';
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/');
};

const onForgotPassword = () => {
  $q.notify({
    type: 'info',
    message: 'Please contact the system administrator to reset your password.',
    position: 'top'
  });
};

defineExpose({
  email,
  password,
  showPassword,
  loading,
  errorMessage,
  rememberMe,
  handleLogin,
  goBack,
  onForgotPassword
});
</script>

<style scoped>
/* MODIFIED: Updated background style with the new generated image */
.login-bg-image {
  min-height: 100vh;
  padding: 48px 16px;
  /* A semi-transparent overlay to ensure text is readable */
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.6)),
    /* New admin-themed background image */
    url('https://wallpaperaccess.com/full/1393237.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.glass-card {
  width: 100%;
  max-width: 450px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.27);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.21);
  padding: 32px 40px;
}
.body--dark .glass-card {
  background-color: rgba(30, 30, 30, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 12px !important;
}

.interactive-link {
  color: #1565c0;
  transition: all 0.2s ease-out;
}
.interactive-link:hover {
  filter: brightness(1.2);
  text-decoration: underline;
}
.body--dark .interactive-link {
  color: #64b5f6;
}
</style>