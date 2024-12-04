import { Request, Response, NextFunction } from "express";
import { S3Service } from "@repo/services";
import { prisma } from "@repo/db";
import { HttpStatusCode } from "@repo/utils";
import config from "../config/config";

const s3Service = S3Service.getInstance();

export class ContestController {
  async createContest(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, contestId, title, startTime, duration, problems } =
        req.body;

      const problemDescriptions = await Promise.all(
        problems.map(async (problem, index) => {
          const key = `problems/${contestId}/${index + 1}.md`;
          const descriptionUrl = await s3Service.uploadWithPresignedUrl(
            config.bucketName as string,
            key,
            problem.description
          );
          return {
            descriptionUrl,
            inputFileUrl: problem.inputFileUrl,
            outputFileUrl: problem.outputFileUrl,
            sampleInput: problem.sampleInput,
            sampleOutput: problem.sampleOutput,
            points: problem.points,
          };
        })
      );

      const contest = await prisma.contest.create({
        data: {
          id: contestId,
          title,
          startTime: new Date(startTime),
          duration,
          userId,
          problems: {
            create: problemDescriptions,
          },
        },
      });

      res
        .status(HttpStatusCode.CREATED)
        .json({ success: true, message: "Contest created successfully" });
    } catch (error) {
      next(error);
    }
  }
}
