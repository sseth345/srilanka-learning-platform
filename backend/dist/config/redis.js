"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.on("error", (err) => {
    console.error("❌ Redis error:", err);
});
redisClient.connect().then(() => {
    console.log("✅ Redis connected");
});
exports.default = redisClient;
//# sourceMappingURL=redis.js.map