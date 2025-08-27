import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for sending cookies with cross-origin requests
});

// Add request interceptor to include token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Remove any existing Bearer prefix and trim whitespace
      const cleanToken = token.replace(/^Bearer\s+/i, '').trim();

      // Only add Bearer if it's not already present in the token
      const authHeader = cleanToken.startsWith('Bearer ')
        ? cleanToken
        : `Bearer ${cleanToken}`;

      config.headers.Authorization = authHeader;

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Adding Authorization header:', {
          hasToken: !!token,
          cleanTokenLength: cleanToken.length,
          authHeaderValue: authHeader.substring(0, 30) + '...'
        });
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, log out the user
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

const adminService = {
  // Admin login
  login: async (credentials) => {
    try {
      console.log('Sending login request with:', { email: credentials.email });
      
      const response = await api.post('/admin/login', {
        email: credentials.email.trim(),
        password: credentials.password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Login response:', response.data);

      if (response.data && response.data.token) {
        // Ensure token has Bearer prefix
        const token = response.data.token.startsWith('Bearer ')
          ? response.data.token
          : `Bearer ${response.data.token}`;
        
        // Store token in localStorage
        localStorage.setItem('adminToken', token);
        
        // Set default auth header for future requests
        api.defaults.headers.common['Authorization'] = token;
        
        return {
          success: true,
          data: response.data,
          token: token,
          admin: response.data.admin,
          redirectTo: response.data.redirectTo || '/admin/dashboard'
        };
      }
      
      return {
        success: false,
        error: response.data?.message || 'Login failed. Please check your credentials.'
      };
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      let errorMessage = 'An error occurred during login. Please try again.';
      
      if (error.response) {
        // Server responded with error status code
        errorMessage = error.response.data?.message || errorMessage;
        
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.status === 429) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      // Clear any existing token on error
      localStorage.removeItem('adminToken');
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Get admin dashboard data
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Failed to load dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to load dashboard stats',
        data: {
          totalUsers: 0,
          jobSeekers: 0,
          totalCompanies: 0,
          pendingApprovals: 0
        }
      };
    }
  },

  // Get pending jobs for approval
  getPendingJobs: async () => {
    try {
      const response = await api.get('/admin/jobs/pending');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch pending jobs',
        data: []
      };
    }
  },

  // Approve a job
  approveJob: async (jobId) => {
    try {
      const response = await api.put(`/admin/jobs/${jobId}/approve`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error approving job:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to approve job'
      };
    }
  },

  // Reject a job
  rejectJob: async (jobId, reason) => {
    try {
      const response = await api.put(`/admin/jobs/${jobId}/reject`, { reason });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error rejecting job:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reject job'
      };
    }
  },

  // Check if admin is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },

  // Get unverified companies
  getUnverifiedCompanies: async () => {
    try {
      console.log('Fetching unverified companies from /admin/companies/pending');
      const response = await api.get('/admin/companies/pending');
      console.log('Unverified companies response:', response.data);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching unverified companies:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch unverified companies',
        data: []
      };
    }
  },

  // Get verified companies
  getVerifiedCompanies: async () => {
    try {
      console.log('Fetching verified companies from /admin/companies/verified');
      const response = await api.get('/admin/companies/verified');
      console.log('Verified companies response:', response.data);
      
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching verified companies:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch verified companies',
        data: []
      };
    }
  },

  // Approve a company (alias for verifyCompany for backward compatibility)
  approveCompany: async (companyId) => {
    try {
      // Using POST method as per backend route definition
      const response = await api.post(`/admin/companies/${companyId}/approve`);
      return {
        success: true,
        data: response.data,
        message: 'Company approved successfully'
      };
    } catch (error) {
      console.error('Error approving company:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to approve company',
        status: error.response?.status
      };
    }
  },

  // Reject a company
  rejectCompany: async (companyId, reason) => {
    try {
      // Make sure we're using the correct endpoint format
      const response = await api.post(`/admin/companies/${companyId}/reject`, { reason });
      return {
        success: true,
        data: response.data,
        message: 'Company rejected successfully'
      };
    } catch (error) {
      console.error('Error rejecting company:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reject company',
        status: error.response?.status
      };
    }
  },

  // Suspend a company
  suspendCompany: async (companyId, reason) => {
    try {
      const response = await api.post(`/admin/companies/${companyId}/suspend`, { reason });
      return {
        success: true,
        data: response.data,
        message: 'Company suspended successfully'
      };
    } catch (error) {
      console.error('Error suspending company:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to suspend company',
        status: error.response?.status
      };
    }
  },

  // Keep verifyCompany for backward compatibility
  verifyCompany: async (companyId) => {
    return adminService.approveCompany(companyId);
  },

  // Ban a company permanently
  banCompany: async (companyId, reason) => {
    try {
      const response = await api.post(`/admin/companies/${companyId}/ban`, { reason });
      return {
        success: true,
        data: response.data,
        message: 'Company banned successfully'
      };
    } catch (error) {
      console.error('Error banning company:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to ban company',
        status: error.response?.status
      };
    }
  },

  // Get available admins
  getAvailableAdmins: async () => {
    // Since we don't have a direct endpoint for available admins,
    // we'll return the current admin for now
    return {
      success: true,
      data: [
        {
          id: 'current',
          name: 'Current Admin',
          email: 'admin@example.com'
        }
      ]
    };
  },

  // Assign company to admin
  assignCompanyToAdmin: async (companyId, adminId) => {
    try {
      // Since we don't have a direct endpoint for assigning companies to admins,
      // we'll simulate a successful response
      console.log(`Would assign company ${companyId} to admin ${adminId}`);
      return {
        success: true,
        data: {
          id: companyId,
          assignedAdminId: adminId,
          status: 'assigned'
        }
      };
    } catch (error) {
      console.error('Error assigning company to admin:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to assign company to admin'
      };
    }
  },

  // Logout admin
  logout: () => {
    localStorage.removeItem('adminToken');
    // Optional: Call backend to invalidate token
    // api.post('/admin/logout').catch(console.error);
  }
};

export default adminService;
