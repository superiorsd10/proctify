import express from "express";
import { ContestController } from "../controllers/ContestController";
import { validationMiddleware } from "@repo/middlewares";
import {
  createContestSchema,
  joinContestSchema,
  runCodeSchema,
  updateContestLogsSchema,
} from "@repo/validation";

const router = express.Router();
const contestController = new ContestController();

router.post(
  "/",
  validationMiddleware(createContestSchema),
  contestController.createContest.bind(contestController)
);

router.get("/:contestId", contestController.getContest.bind(contestController));

router.post(
  "/join",
  validationMiddleware(joinContestSchema),
  contestController.joinContest.bind(contestController)
);

router.get(
  "/monitor",
  contestController.fetchContestLogs.bind(contestController)
);

router.post(
  "/update-log",
  validationMiddleware(updateContestLogsSchema),
  contestController.updateContestLog.bind(contestController)
);

router.post(
  "/run-code",
  validationMiddleware(runCodeSchema),
  contestController.runCode.bind(contestController)
);

export default router;
