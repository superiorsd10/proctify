import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { nanoid } from "nanoid";
import { HttpStatusCode } from "@repo/utils";

export class TestController {
  async createTest(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, createdBy, link, startTime, duration } = req.body;

      let code = nanoid(10);
      let isUnique = false;
      const existingTest = await prisma.test.findUnique({ where: { code } });
      if (!existingTest) {
        isUnique = true;
      }

      while (!isUnique) {
        code = nanoid(10);
        const existingTest = await prisma.test.findUnique({ where: { code } });
        if (!existingTest) {
          isUnique = true;
        }
      }

      const newTest = await prisma.test.create({
        data: {
          title,
          createdBy,
          link,
          startTime: new Date(startTime),
          duration,
          code,
        },
      });

      res.status(HttpStatusCode.CREATED).json({
        message: "Test created successfully",
        test: newTest,
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async joinTest(req: Request, res: Response, next: NextFunction) {
    try {
      const { testId, userId } = req.body;

      const test = await prisma.test.findUnique({ where: { code: testId } });
      if (!test) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ success: false, message: "Test not found" });
      }

      const existingLog = await prisma.log.findFirst({
        where: { testId, userId },
      });

      if (existingLog) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "User has already joined the test",
        });
      }

      const log = await prisma.log.create({
        data: {
          testId,
          userId,
          audioViolations: 0,
          noFaceViolations: 0,
          multipleFaceViolations: 0,
          keypressViolations: 0,
          rightClickViolations: 0,
          windowChangeViolations: 0,
          prohibitedObjectViolations: 0,
          ufmScore: 0,
        },
      });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: "User successfully joined the test",
        log,
      });
    } catch (error) {
      next(error);
    }
  }
}
