import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import {
  createRateLimiterMiddleware,
  errorHandlerMiddleware,
} from "@repo/middlewares";
import { RedisService } from "@repo/services";
import testRoutes from "./routes/testRoutes";
import contestRoutes from "./routes/contestRoutes";

export default function createApp(): Express {
  const app = express();

  const redisService = RedisService.getInstance();
  const rateLimiterMiddleware = createRateLimiterMiddleware(redisService);

  app.use(helmet());
  app.use(morgan("dev"));
  app.use(cors());
  app.use(express.json());

  app.use(rateLimiterMiddleware);

  app.use("/test", testRoutes);
  app.use("/contest", contestRoutes);

  app.use(errorHandlerMiddleware);

  return app;
}
