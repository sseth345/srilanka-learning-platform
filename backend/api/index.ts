// Vercel serverless function handler for Express app
// Vercel will compile TypeScript automatically
import app from '../src/index';
app.use("/api", apiLimiter);import { apiLimiter } from '../src/middleware/ratelimiter';
// Export as default handler for Vercel
export default app;

