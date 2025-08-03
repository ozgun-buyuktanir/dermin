/**
 * Authentication service for backend API
 * Replaces Firebase authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.user = null;
  }

  // Set authorization header for API calls
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  // Check if user exists
  async checkUserExists(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to check user');
      }

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Check user error:', error);
      throw error;
    }
  }

  // Register new user
  async register(email, password, displayName = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();
      this.token = data.access_token;
      localStorage.setItem('auth_token', this.token);
      
      // Get user info after registration
      await this.getCurrentUser();
      
      return { user: this.user };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.log('Login error response:', error);
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('Login success, token received');
      this.token = data.access_token;
      localStorage.setItem('auth_token', this.token);
      
      // Get user info after login
      await this.getCurrentUser();
      
      return { user: this.user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Get current user info
  async getCurrentUser() {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          return null;
        }
        throw new Error('Failed to get user info');
      }

      this.user = await response.json();
      return this.user;
    } catch (error) {
      console.error('Get user error:', error);
      this.logout();
      return null;
    }
  }

  // Update user profile
  async updateProfile(updateData) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Profile update failed');
      }

      this.user = await response.json();
      return this.user;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  // Logout user
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    // Clear all user-specific data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('dermin_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Check if user email is verified (for compatibility with Firebase structure)
  isEmailVerified() {
    // Since we're using backend auth, we assume email is verified after successful login
    return this.isAuthenticated();
  }

  // Auth state change listener (for compatibility with Firebase structure)
  onAuthStateChanged(callback) {
    // Simulate Firebase auth state change
    const checkAuth = async () => {
      if (this.token) {
        const user = await this.getCurrentUser();
        callback(user ? { ...user, emailVerified: true, uid: user.id } : null);
      } else {
        callback(null);
      }
    };

    checkAuth();

    // Return unsubscribe function
    return () => {};
  }

  // Send password reset email (placeholder - implement based on your backend)
  async sendPasswordResetEmail(email) {
    // TODO: Implement password reset endpoint in backend
    console.log('Password reset for:', email);
    throw new Error('Password reset not implemented yet');
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
