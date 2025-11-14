/**
 * Optimization settings for free tier hosting
 * These settings help stay within free tier limits
 */
export declare const OPTIMIZATION_CONFIG: {
    PAGINATION: {
        DEFAULT_LIMIT: number;
        MAX_LIMIT: number;
    };
    CLOUDINARY: {
        VIDEO_QUALITY: string;
        MAX_VIDEO_WIDTH: number;
        MAX_VIDEO_HEIGHT: number;
        EAGER_TRANSFORMATIONS: boolean;
        IMAGE_QUALITY: string;
        IMAGE_FORMAT: string;
    };
    RATE_LIMIT: {
        WINDOW_MS: number;
        MAX_REQUESTS: number;
    };
    CACHE: {
        TTL: number;
    };
};
/**
 * Get pagination parameters from query
 */
export declare const getPaginationParams: (query: any) => {
    limit: number;
    offset: number;
};
//# sourceMappingURL=optimization.d.ts.map