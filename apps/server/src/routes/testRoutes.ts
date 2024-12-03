import express from "express";
import { TestController } from "../controllers/TestController";

const router = express.Router();
const testController = new TestController();

router.post("/", testController.createTest.bind(testController));

export default router;