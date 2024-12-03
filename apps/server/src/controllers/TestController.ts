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
}
