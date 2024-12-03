import express from "express";
import { TestController } from "../controllers/TestController";
import { validationMiddleware } from "@repo/middlewares";
import {
  createTestSchema,
  joinTestSchema,
  updateLogsSchema,
} from "@repo/validation";

const router = express.Router();
const testController = new TestController();

router.post(
  "/",
  validationMiddleware(createTestSchema),
  testController.createTest.bind(testController)
);

router.post(
  "/join",
  validationMiddleware(joinTestSchema),
  testController.joinTest.bind(testController)
);

router.get("/monitor", testController.fetchTestLogs.bind(testController));

router.post(
  "/update-logs",
  validationMiddleware(updateLogsSchema),
  testController.updateLog.bind(testController)
);

export default router;
