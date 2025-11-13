/**
 * Optimization settings for free tier hosting
 * These settings help stay within free tier limits
 */

export const OPTIMIZATION_CONFIG = {
  // Database pagination limits
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 50,
  },

  // Cloudinary optimization
  CLOUDINARY: {
    // Video quality settings (lower = less bandwidth)
    VIDEO_QUALITY: 'auto:low',
    MAX_VIDEO_WIDTH: 1280,
    MAX_VIDEO_HEIGHT: 720,
    
    // Don't pre-generate formats (saves transformations)
    EAGER_TRANSFORMATIONS: false,
    
    // Image optimization
    IMAGE_QUALITY: 'auto',
    IMAGE_FORMAT: 'auto',
  },

  // Rate limiting (already configured in index.ts)
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // per IP
  },

  // Cache settings
  CACHE: {
    // Cache frequently accessed data for 5 minutes
    TTL: 5 * 60 * 1000, // 5 minutes
  },
};

/**
 * Get pagination parameters from query
 */
export const getPaginationParams = (query: any) => {
  const limit = Math.min(
    parseInt(query.limit) || OPTIMIZATION_CONFIG.PAGINATION.DEFAULT_LIMIT,
    OPTIMIZATION_CONFIG.PAGINATION.MAX_LIMIT
  );
  const offset = parseInt(query.offset) || 0;
  
  return { limit, offset };
};

