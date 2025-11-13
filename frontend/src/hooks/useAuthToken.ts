import { useAuth } from '../contexts/AuthContext';

export const useAuthToken = () => {
  const { user } = useAuth();

  const getAuthHeaders = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const token = await user.getIdToken(true); // Force refresh
      return {
        Authorization: `Bearer ${token}`,
      };
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw new Error('Failed to get authentication token');
    }
  };

  return { getAuthHeaders };
};

