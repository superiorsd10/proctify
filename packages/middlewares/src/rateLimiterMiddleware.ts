import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { RedisService } from "@repo/services";
import { HttpStatusCode } from "@repo/utils";

export const createRateLimiterMiddleware = (redisService: RedisService) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) =>
        redisService.getClient().sendCommand(args),
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(HttpStatusCode.TOO_MANY_REQUESTS).json({
        error: "Too many requests, please try again later.",
        success: false,
      });
    },
    keyGenerator: (req) => {
      return req.ip!;
    },
  });
};
