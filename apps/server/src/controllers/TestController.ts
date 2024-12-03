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
        res.status(HttpStatusCode.CREATED).json({
          success: true,
          message: "User successfully joined the test",
          data: existingLog,
          link: test.link,
          startTime: test.startTime,
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
        startTime: test.startTime,
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
        },
        orderBy: {
          ufmScore: "desc",
        },
        skip,
        take: 10,
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      const totalLogs = await prisma.log.count({
        where: {
          testId: testId as string,
        },
      });

      const totalPages = Math.ceil(totalLogs / 10);

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        message: "Fetched test logs successfully",
        data: logs.map((log) => ({
          ...log,
          username: log.user?.username, // Add the username to the log object
        })),
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

  async updateLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { testId, userId, violations } = req.body;

      const log = await prisma.log.findFirst({
        where: { testId, userId },
      });

      if (!log) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Log entry not found",
        });
        return;
      }

      const updatedLogData: Partial<typeof log> = { ...log };
      let updatedUfmScore = log.ufmScore;

      for (const violation of violations) {
        if (violation.type in updatedLogData) {
          updatedLogData[violation.type as keyof typeof log] += violation.count;
        }

        const violationWeights: Record<string, number> = {
          audioViolations: 1,
          noFaceViolations: 2,
          multipleFaceViolations: 3,
          keypressViolations: 2,
          rightClickViolations: 2,
          windowChangeViolations: 2,
          prohibitedObjectViolations: 5,
        };

        if (violation.type in violationWeights) {
          updatedUfmScore += violation.count * violationWeights[violation.type];
        }
      }

      updatedLogData.ufmScore = updatedUfmScore;

      const updatedLog = await prisma.log.update({
        where: { id: log.id },
        data: updatedLogData,
      });

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        message: "Log updated successfully",
        data: updatedLog,
      });
    } catch (error) {
      next(error);
    }
  }
}
