import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  loading: boolean;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const useApi = () => {
  const { getIdToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const makeRequest = useCallback(async <T = any>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    const {
      method = 'GET',
      headers = {},
      body,
      requireAuth = true
    } = options;

    setLoading(true);

    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers
      };

      // Add authorization header if required
      if (requireAuth) {
        try {
          const token = await getIdToken();
          requestHeaders.Authorization = `Bearer ${token}`;
        } catch (error) {
          console.error('Failed to get ID token:', error);
          return {
            error: 'Authentication required',
            loading: false
          };
        }
      }

      const config: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          loading: false
        };
      }

      return {
        data,
        loading: false
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        loading: false
      };
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  // Convenience methods
  const get = useCallback(<T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    makeRequest<T>(endpoint, { ...options, method: 'GET' }), [makeRequest]);

  const post = useCallback(<T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    makeRequest<T>(endpoint, { ...options, method: 'POST', body }), [makeRequest]);

  const put = useCallback(<T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    makeRequest<T>(endpoint, { ...options, method: 'PUT', body }), [makeRequest]);

  const del = useCallback(<T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    makeRequest<T>(endpoint, { ...options, method: 'DELETE' }), [makeRequest]);

  const patch = useCallback(<T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    makeRequest<T>(endpoint, { ...options, method: 'PATCH', body }), [makeRequest]);

  return {
    loading,
    makeRequest,
    get,
    post,
    put,
    delete: del,
    patch
  };
};

// Custom hook for user profile API calls
export const useUserApi = () => {
  const api = useApi();

  const getUserProfile = useCallback(() =>
    api.get('/users/profile'), [api]);

  const updateUserProfile = useCallback((updates: any) =>
    api.put('/users/profile', updates), [api]);

  const getAllUsers = useCallback(() =>
    api.get('/users'), [api]);

  const updateUserRole = useCallback((userId: string, role: string) =>
    api.put(`/users/${userId}/role`, { role }), [api]);

  const deleteUser = useCallback((userId: string) =>
    api.delete(`/users/${userId}`), [api]);

  return {
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    updateUserRole,
    deleteUser,
    loading: api.loading
  };
};

// Custom hook for content API calls
export const useContentApi = () => {
  const api = useApi();

  const getContent = useCallback((params?: { type?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const endpoint = queryParams.toString() ? `/content?${queryParams}` : '/content';
    return api.get(endpoint);
  }, [api]);

  const getContentById = useCallback((id: string) =>
    api.get(`/content/${id}`), [api]);

  const createContent = useCallback((content: any) =>
    api.post('/content', content), [api]);

  const updateContent = useCallback((id: string, updates: any) =>
    api.put(`/content/${id}`, updates), [api]);

  const deleteContent = useCallback((id: string) =>
    api.delete(`/content/${id}`), [api]);

  const publishContent = useCallback((id: string, published: boolean) =>
    api.patch(`/content/${id}/publish`, { published }), [api]);

  return {
    getContent,
    getContentById,
    createContent,
    updateContent,
    deleteContent,
    publishContent,
    loading: api.loading
  };
};

// Custom hook for authentication API calls
export const useAuthApi = () => {
  const api = useApi();

  const verifyToken = useCallback((token: string) =>
    api.post('/auth/verify', { token }, { requireAuth: false }), [api]);

  const getUserById = useCallback((uid: string) =>
    api.get(`/auth/user/${uid}`), [api]);

  const updateUserStatus = useCallback((uid: string, disabled: boolean) =>
    api.patch(`/auth/user/${uid}/status`, { disabled }), [api]);

  return {
    verifyToken,
    getUserById,
    updateUserStatus,
    loading: api.loading
  };
};
