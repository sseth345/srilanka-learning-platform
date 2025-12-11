"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = void 0;
// src/middleware/rateLimiter.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 1000, // 15 seconds
    max: 30, // ⛔ Max 30 requests / 15 seconds per IP
    message: {
        error: "Too many requests. Slow down.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=ratelimiter.js.map