import { create } from 'zustand';
import api from '../lib/axios';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: false,
  error: null,
  initialAuthCheckComplete: false,

  initializeAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await api.get('/api/v1/auth/check-session');
      
      if (response.data?.data?.user) {
        set({
          user: response.data.data.user,
          isAuthenticated: true,
          isCheckingAuth: false,
          initialAuthCheckComplete: true
        });
      } else {
        set({ 
          isCheckingAuth: false, 
          initialAuthCheckComplete: true 
        });
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      set({ 
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false,
        initialAuthCheckComplete: true
      });
    }
  },

  login: async (email, password) => {
    console.log('[AuthStore] Login initiated');

    // Handle both direct params and object param
    const loginData = typeof email === 'object' 
      ? { email: email.email, password: email.password }
      : { email, password };

    console.debug('Login credentials:', loginData);
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/api/v1/auth/login', {
        email: loginData.email.trim(),
        password: loginData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true 
      });

      console.log('[AuthStore] Login response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      if (!response.data?.data?.user) {
        console.error('[AuthStore] Missing user data in response');
        throw new Error('User data missing');
      }

      const { user } = response.data.data;

      set({
        user,
        isAuthenticated: true,
        isLoading: false
      });

      console.log('[AuthStore] Login successful for:', user.email);
      return user;

    } catch (err) {
      console.error('[AuthStore] Login failed:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        response: {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers
        }
      });

      let errorMessage = 'Login failed. Please try again.';
      
      if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data.message || 'Invalid request format';
            break;
          case 401:
            errorMessage = err.response.data.message || 'Invalid email or password';
            break;
          case 403:
            errorMessage = err.response.data.message || 'Account temporarily locked';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
        }
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      });

      throw new Error(errorMessage);
    }
  },

  signup: async (userData) => {
    console.debug('[AuthStore] Signup initiated with data:', userData);
    set({ isLoading: true, error: null });
  
    try {
      console.debug('[AuthStore] Making signup request...');
      const response = await api.post('/api/v1/auth/signup', userData, {
        withCredentials: true
      });
      
      if (!response.data?.data?.user) {
        console.warn('[AuthStore] Invalid server response format');
        throw new Error('Invalid server response format');
      }
      
      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false
      });

      console.debug('[AuthStore] Signup successful, returning user data');
      return response.data.data.user;
      
    } catch (err) {
      console.error('[AuthStore] Signup error:', {
        error: err,
        response: err.response,
        config: err.config
      });
      
      let errorMessage = 'Signup failed. Please try again.';
      let errorType = 'generic';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Server is not responding. Please try again later.';
        errorType = 'timeout';
      } else if (err.response) {
        if (err.response.status === 409) {
          errorMessage = err.response.data.message || 'Email already registered. Please log in.';
          errorType = 'email_conflict';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.message || 'Validation error. Please check your input.';
          errorType = 'validation';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Check your internet connection.';
        errorType = 'network';
      }
      
      set({ 
        error: null, 
        isLoading: false 
      });
      
      const errorToThrow = new Error(errorMessage);
      errorToThrow.type = errorType;
      
      if (err.response?.data?.errors) {
        errorToThrow.errors = err.response.data.errors;
      }
      
      throw errorToThrow;
    }
  },

  logout: async () => {
    console.log('[AuthStore] Initiating logout');

    if (!get().isAuthenticated) {
      console.log('[AuthStore] Not authenticated, skipping logout');
      return;
    }
    
    try {
      await api.post('/api/v1/auth/logout', {}, {
        withCredentials: true
      });
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      console.log('[AuthStore] Logout completed');
    } catch (err) {
      console.error('[AuthStore] Logout failed:', err);
      // Ensure state is cleared even if error occurs
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      throw err;
    }
  },


  loadUser: async () => {
    console.debug('[AuthStore] Loading user session...');
    set({ isLoading: true });
    
    try {
      const response = await api.get('/api/v1/users/me', {
        withCredentials: true
      });
      
      if (!response.data?.data?.user) {
        console.warn('[AuthStore] Invalid user data received');
        throw new Error('Invalid user data received');
      }

      set({ 
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false
      });
      
      console.debug('[AuthStore] User session loaded successfully');
      return response.data.data.user;
    } catch (err) {
      console.error('[AuthStore] Load user error:', err);
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      throw err;
    }
  }

  }));

export default useAuthStore;