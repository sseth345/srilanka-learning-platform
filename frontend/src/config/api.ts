/**
 * API Configuration
 * Centralized API URL management for production and development
 */

const getApiBaseUrl = (): string => {
  // Priority: VITE_API_URL > VITE_API_BASE_URL > default
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Development fallback
  return 'http://localhost:3001';
};

const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Remove trailing slash from base URL
  const cleanBase = baseUrl.replace(/\/$/, '');
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If base URL already includes /api, don't add it again
  if (cleanBase.includes('/api')) {
    return `${cleanBase}${cleanEndpoint}`;
  }
  
  return `${cleanBase}/api${cleanEndpoint}`;
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  getUrl: getApiUrl,
};

// Export convenience function
export const getApiEndpoint = (endpoint: string): string => getApiUrl(endpoint);

