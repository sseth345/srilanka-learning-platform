import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err: any) => {
  console.error("❌ Redis error:", err);
});

redisClient.connect().then(() => {
  console.log("✅ Redis connected");
});

export default redisClient;
