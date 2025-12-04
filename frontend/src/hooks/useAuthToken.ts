import { useAuth } from '../contexts/AuthContext';

// Token cache to avoid excessive refresh calls
let cachedToken: string | null = null;
let tokenExpiry: number = 0;
const TOKEN_CACHE_DURATION = 50 * 60 * 1000; // 50 minutes (tokens expire in 1 hour)

export const useAuthToken = () => {
  const { user } = useAuth();

  const getAuthHeaders = async (forceRefresh = false) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if we have a valid cached token
      const now = Date.now();
      if (!forceRefresh && cachedToken && tokenExpiry > now) {
        return {
          Authorization: `Bearer ${cachedToken}`,
        };
      }

      // Get token (only force refresh if explicitly requested)
      const token = await user.getIdToken(forceRefresh);
      
      // Cache the token
      cachedToken = token;
      tokenExpiry = now + TOKEN_CACHE_DURATION;
      
      return {
        Authorization: `Bearer ${token}`,
      };
    } catch (error: any) {
      console.error('Error getting auth token:', error);
      
      // Handle quota exceeded error specifically
      if (error?.code === 'auth/quota-exceeded') {
        // Clear cache and try once more without force refresh
        cachedToken = null;
        tokenExpiry = 0;
        
        try {
          const token = await user.getIdToken(false); // Don't force refresh
          cachedToken = token;
          tokenExpiry = Date.now() + TOKEN_CACHE_DURATION;
          return {
            Authorization: `Bearer ${token}`,
          };
        } catch (retryError) {
          throw new Error('Firebase quota exceeded. Please try again later.');
        }
      }
      
      throw new Error('Failed to get authentication token');
    }
  };

  return { getAuthHeaders };
};

