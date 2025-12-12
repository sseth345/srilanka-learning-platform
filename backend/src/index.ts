import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import contentRoutes from './routes/content';
import booksRoutes from './routes/books';
import videosRoutes from './routes/videos';
import discussionsRoutes from './routes/discussions';
import commentsRoutes from './routes/comments';
import exercisesRoutes from './routes/exercises';
import newsRoutes from './routes/news';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const BASE_PORT = Number(process.env.PORT) || 3001;
const MAX_PORT_SCAN = Number(process.env.PORT_SCAN_RANGE || 5);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration — allow ALL origins
app.use(
  cors({
    origin: true,            // reflect request origin (allows all)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin"
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"]
  })
);


// Logging
app.use(morgan('combined'));

// Body parsing middleware - increased limits for video uploads
app.use(express.json({ limit: '550mb' }));
app.use(express.urlencoded({ extended: true, limit: '550mb' }));

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
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/discussions', discussionsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  const startServer = (port: number, attemptsLeft: number) => {
    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📚 Sri Lankan Learning Platform API`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Increase timeout for large file uploads (15 minutes)
    server.timeout = 900000;
    server.keepAliveTimeout = 65000;

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
        console.warn(`⚠️  Port ${port} is in use. Trying port ${port + 1}...`);
        setTimeout(() => startServer(port + 1, attemptsLeft - 1), 500);
      } else {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
      }
    });
  };

  startServer(BASE_PORT, MAX_PORT_SCAN);
}

export default app;
