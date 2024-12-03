import express from "express";
import { TestController } from "../controllers/TestController";
import { validationMiddleware } from "@repo/middlewares";
import { createTestSchema } from "@repo/validation";

const router = express.Router();
const testController = new TestController();

router.post(
  "/",
  validationMiddleware(createTestSchema),
  testController.createTest.bind(testController)
);

export default router;
