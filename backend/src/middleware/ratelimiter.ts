// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds
  max: 30,             // ⛔ Max 30 requests / 15 seconds per IP
  message: {
    error: "Too many requests. Slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
