"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const content_1 = __importDefault(require("./routes/content"));
const books_1 = __importDefault(require("./routes/books"));
const videos_1 = __importDefault(require("./routes/videos"));
const discussions_1 = __importDefault(require("./routes/discussions"));
const comments_1 = __importDefault(require("./routes/comments"));
const exercises_1 = __importDefault(require("./routes/exercises"));
const news_1 = __importDefault(require("./routes/news"));
const analytics_1 = __importDefault(require("./routes/analytics"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const BASE_PORT = Number(process.env.PORT) || 3001;
const MAX_PORT_SCAN = Number(process.env.PORT_SCAN_RANGE || 5);
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL,
        'https://srilanka-learning-platform.vercel.app',
        'https://srilanka-learning-platform.vercel.app/',
        /^https:\/\/.*\.vercel\.app$/,
        /^https:\/\/.*\.vercel\.app\/?$/
    ].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            callback(null, true);
            return;
        }
        // Check if origin matches any allowed origin
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
                const normalizedOrigin = origin.replace(/\/$/, ''); // Remove trailing slash
                const normalizedAllowed = allowed.replace(/\/$/, '');
                return normalizedOrigin === normalizedAllowed || normalizedOrigin.startsWith(normalizedAllowed);
            }
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return false;
        });
        if (isAllowed || allowedOrigins.length === 0) {
            callback(null, true);
        }
        else {
            console.warn(`⚠️  CORS blocked origin: ${origin}`);
            console.warn(`   Allowed origins:`, allowedOrigins);
            // In production, be more permissive to avoid blocking legitimate requests
            if (process.env.NODE_ENV === 'production') {
                console.warn(`   Allowing anyway in production mode`);
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
// Logging
app.use((0, morgan_1.default)('combined'));
// Body parsing middleware - increased limits for video uploads
app.use(express_1.default.json({ limit: '550mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '550mb' }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Sri Lankan Learning Platform API'
    });
});
// Root endpoint for Render health checks
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Sri Lankan Learning Platform API',
        timestamp: new Date().toISOString()
    });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/content', content_1.default);
app.use('/api/books', books_1.default);
app.use('/api/videos', videos_1.default);
app.use('/api/discussions', discussions_1.default);
app.use('/api/comments', comments_1.default);
app.use('/api/exercises', exercises_1.default);
app.use('/api/news', news_1.default);
app.use('/api/analytics', analytics_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Only start server if not running as Vercel serverless function
// Vercel sets VERCEL environment variable
if (!process.env.VERCEL) {
    const startServer = (port, attemptsLeft) => {
        const server = app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
            console.log(`📚 Sri Lankan Learning Platform API`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
        // Increase timeout for large file uploads (15 minutes)
        server.timeout = 900000;
        server.keepAliveTimeout = 65000;
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
                console.warn(`⚠️  Port ${port} is in use. Trying port ${port + 1}...`);
                setTimeout(() => startServer(port + 1, attemptsLeft - 1), 500);
            }
            else {
                console.error('❌ Failed to start server:', err);
                process.exit(1);
            }
        });
    };
    startServer(BASE_PORT, MAX_PORT_SCAN);
}
exports.default = app;
//# sourceMappingURL=index.js.map