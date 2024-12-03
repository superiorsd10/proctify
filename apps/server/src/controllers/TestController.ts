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
        data: newTest,
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
        res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ success: false, message: "Test not found" });
        return;
      }

      const existingLog = await prisma.log.findFirst({
        where: { testId, userId },
      });

      if (existingLog) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "User has already joined the test",
        });
        return;
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
        data: log,
        link: test.link,
      });
    } catch (error) {
      next(error);
    }
  }

  async fetchTestLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { testId, userId, page = 1 } = req.query;

      if (!testId || !userId) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "testId and userId are required",
        });
        return;
      }

      const test = await prisma.test.findUnique({
        where: { code: testId as string },
      });

      if (!test) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Test not found",
        });
        return;
      }

      if (test.createdBy !== userId) {
        res.status(HttpStatusCode.FORBIDDEN).json({
          success: false,
          message: "You are not authorized to view these logs",
        });
        return;
      }

      const pageNumber = parseInt(page as string, 10);
      const skip = (pageNumber - 1) * 10;

      const logs = await prisma.log.findMany({
        where: {
          testId: testId as string,
          userId: userId as string,
        },
        orderBy: {
          ufmScore: "desc",
        },
        skip,
        take: 10,
      });

      const totalLogs = await prisma.log.count({
        where: {
          testId: testId as string,
          userId: userId as string,
        },
      });

      const totalPages = Math.ceil(totalLogs / 10);

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        message: "Fetched test logs successfully",
        data: logs,
        title: test.title,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalLogs,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
