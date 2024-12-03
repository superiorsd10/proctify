import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import {
  createRateLimiterMiddleware,
  errorHandlerMiddleware,
} from "@repo/middlewares";
import { RedisService } from "@repo/services";

export default function createApp(): Express {
  const app = express();

  const redisService = RedisService.getInstance();
  const rateLimiterMiddleware = createRateLimiterMiddleware(redisService);

  app.use(helmet());
  app.use(morgan("dev"));
  app.use(cors());
  app.use(express.json());

  app.use(rateLimiterMiddleware);

  // routes

  app.use(errorHandlerMiddleware);

  return app;
}
