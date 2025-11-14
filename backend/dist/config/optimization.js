"use strict";
/**
 * Optimization settings for free tier hosting
 * These settings help stay within free tier limits
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationParams = exports.OPTIMIZATION_CONFIG = void 0;
exports.OPTIMIZATION_CONFIG = {
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
const getPaginationParams = (query) => {
    const limit = Math.min(parseInt(query.limit) || exports.OPTIMIZATION_CONFIG.PAGINATION.DEFAULT_LIMIT, exports.OPTIMIZATION_CONFIG.PAGINATION.MAX_LIMIT);
    const offset = parseInt(query.offset) || 0;
    return { limit, offset };
};
exports.getPaginationParams = getPaginationParams;
//# sourceMappingURL=optimization.js.map