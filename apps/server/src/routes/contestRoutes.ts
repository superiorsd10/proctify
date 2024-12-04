import express from "express";
import { ContestController } from "../controllers/ContestController";
import { validationMiddleware } from "@repo/middlewares";
import { createContestSchema } from "@repo/validation";

const router = express.Router();
const contestController = new ContestController();

router.post(
  "/",
  validationMiddleware(createContestSchema),
  contestController.createContest.bind(contestController)
);

export default router;
