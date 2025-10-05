// Authentication utility functions

/**
 * Clear all authentication data from localStorage
 * This ensures a complete logout
 */
export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  const role = localStorage.getItem('user_role');
  return role === 'admin';
};

/**
 * Get current user role
 */
export const getUserRole = (): string | null => {
  return localStorage.getItem('user_role');
};
