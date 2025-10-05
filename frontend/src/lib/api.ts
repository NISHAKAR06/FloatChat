// API utility functions with automatic token refresh
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: this.refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access;
        localStorage.setItem('access_token', data.access);
        return true;
      } else {
        // Refresh failed, clear tokens
        this.clearTokens();
        return false;
      }
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Prepare headers
    const headers = new Headers(options.headers);

    // Add authorization header if token exists
    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    // Set default content type if not already set
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // If unauthorized and we have a refresh token, try to refresh
      if (response.status === 401 && this.refreshToken && !this.isRefreshing) {
        this.isRefreshing = true;
        this.refreshPromise = this.refreshAccessToken();

        const refreshSuccess = await this.refreshPromise;

        this.isRefreshing = false;
        this.refreshPromise = null;

        if (refreshSuccess && this.accessToken) {
          // Retry the original request with new token
          headers.set('Authorization', `Bearer ${this.accessToken}`);

          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          // Refresh failed, return the original 401 response
          return {
            status: 401,
            error: 'Authentication failed',
          };
        }
      }

      const data = await response.json().catch(() => ({}));

      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.detail || data.error || 'Request failed',
        status: response.status,
      };
    } catch (error) {
      return {
        status: 0,
        error: 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  // Manual login method
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email, // Use email as username
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store tokens
      this.accessToken = data.access;
      this.refreshToken = data.refresh;
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
    }

    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.detail || 'Login failed',
      status: response.status,
    };
  }

  // Manual logout method
  logout() {
    this.clearTokens();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Helper functions for common API calls
export const api = {
  // Authentication
  login: (email: string, password: string) => apiClient.login(email, password),
  logout: () => apiClient.logout(),
  isAuthenticated: () => apiClient.isAuthenticated(),
  register: async (email: string, password: string) => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';
    const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        email: email,
        password: password,
      }),
    });
    const data = await response.json();
    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.detail || data.error || 'Registration failed',
      status: response.status,
    };
  },

  // Datasets
  getDatasets: () => apiClient.get('/api/datasets/datasets/'),
  uploadNetCDF: (formData: FormData) => {
    return fetch(`${API_BASE_URL}/api/datasets/upload-netcdf/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    }).then(res => res.json());
  },
  getDatasetStatus: (id: string) => apiClient.get(`/api/datasets/dataset-status/${id}/`),
  getDatasetMetadata: (id: string) => apiClient.get(`/api/datasets/dataset-metadata/${id}/`),
};
