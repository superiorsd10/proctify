import { Request, Response, NextFunction } from "express";
import { S3Service, KafkaService, RedisService } from "@repo/services";
import { prisma } from "@repo/db";
import { HttpStatusCode } from "@repo/utils";
import config from "../config/config";
import { nanoid } from "nanoid";

const s3Service = S3Service.getInstance();
const redisService = RedisService.getInstance();

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

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: "Contest created successfully",
        code: contestId,
      });
    } catch (error) {
      next(error);
    }
  }

  async getContest(req: Request, res: Response, next: NextFunction) {
    try {
      const { contestId } = req.params;

      if (!contestId) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Contest ID is required.",
        });
        return;
      }

      const contest = await prisma.contest.findUnique({
        where: { id: contestId },
        include: {
          problems: true, // Include associated problems
        },
      });

      if (!contest) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Contest not found.",
        });
        return;
      }

      const response = {
        id: contest.id,
        title: contest.title,
        startTime: contest.startTime.toISOString(),
        duration: contest.duration,
        userId: contest.userId,
        problems: contest.problems.map((problem) => ({
          id: problem.id,
          contestId: problem.contestId,
          descriptionUrl: problem.descriptionUrl,
          inputFileUrl: problem.inputFileUrl,
          outputFileUrl: problem.outputFileUrl,
          sampleInput: problem.sampleInput,
          sampleOutput: problem.sampleOutput,
          points: problem.points,
        })),
      };

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error("Error fetching contest:", error);
      next(error);
    }
  }

  async joinContest(req: Request, res: Response, next: NextFunction) {
    try {
      const { contestId, userId } = req.body;

      const contest = await prisma.contest.findUnique({
        where: { id: contestId },
      });
      if (!contest) {
        res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ success: false, message: "Contest not found" });
        return;
      }

      const existingContestLog = await prisma.contestLog.findFirst({
        where: { contestId, userId },
      });

      if (existingContestLog) {
        res.status(HttpStatusCode.CREATED).json({
          success: true,
          message: "User successfully joined the contest",
          data: existingContestLog,
          startTime: contest.startTime,
        });
        return;
      }

      const contestLog = await prisma.contestLog.create({
        data: {
          contestId,
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
        message: "User successfully joined the contest",
        data: contestLog,
        startTime: contest.startTime,
      });
    } catch (error) {
      next(error);
    }
  }

  async fetchContestLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { contestId, userId, page = 1 } = req.query;

      if (!contestId || !userId) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "contestId and userId are required",
        });
        return;
      }

      const contest = await prisma.contest.findUnique({
        where: { id: contestId as string },
      });

      if (!contest) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Contest not found",
        });
        return;
      }

      if (contest.userId !== userId) {
        res.status(HttpStatusCode.FORBIDDEN).json({
          success: false,
          message: "You are not authorized to view these contest logs",
        });
        return;
      }

      const pageNumber = parseInt(page as string, 10);
      const skip = (pageNumber - 1) * 10;

      const contestLogs = await prisma.contestLog.findMany({
        where: {
          contestId: contestId as string,
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

      const totalContestLogs = await prisma.contestLog.count({
        where: {
          contestId: contestId as string,
        },
      });

      const totalPages = Math.ceil(totalContestLogs / 10);

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        message: "Fetched contest logs successfully",
        data: contestLogs.map((contestLog) => ({
          ...contestLog,
          username: contestLog.user?.username,
        })),
        title: contest.title,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalContestLogs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateContestLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { contestId, userId, violations } = req.body;

      const contestLog = await prisma.contestLog.findFirst({
        where: { contestId, userId },
      });

      if (!contestLog) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Contest log entry not found",
        });
        return;
      }

      const updatedContestLogData: Partial<typeof contestLog> = {
        ...contestLog,
      };
      let updatedUfmScore = contestLog.ufmScore;

      for (const violation of violations) {
        if (violation.type in updatedContestLogData) {
          updatedContestLogData[violation.type as keyof typeof contestLog] +=
            violation.count;
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

      updatedContestLogData.ufmScore = updatedUfmScore;

      const updatedContestLog = await prisma.contestLog.update({
        where: { id: contestLog.id },
        data: updatedContestLogData,
      });

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        message: "Contest log updated successfully",
        data: updatedContestLog,
      });
    } catch (error) {
      next(error);
    }
  }

  async runCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, language, input, output } = req.body;

      const runId = nanoid(10);

      const payload = {
        runId,
        code,
        language,
        input,
        output,
        timestamp: new Date().toISOString(),
      };

      const kafkaService = KafkaService.getInstance();
      const producer = await kafkaService.getProducer();

      await producer.send({
        topic: "code-run-requests",
        messages: [
          {
            key: runId,
            value: JSON.stringify(payload),
          },
        ],
      });

      res.status(HttpStatusCode.ACCEPTED).json({
        status: "processing",
        message: "Code submitted successfully",
        runId,
      });
    } catch (error) {
      console.error("Error in runCode:", error);
      next(error);
    }
  }

  async getRunCodeResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { runId } = req.query;

      if (!runId) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Missing required query parameter" });
        return;
      }

      const key = `runCode:${runId}`;

      const result = await redisService.get(key);

      if (!result) {
        res.status(HttpStatusCode.NOT_FOUND).json({ message: "processing" });
        return;
      }

      res.status(HttpStatusCode.SUCCESS).json(JSON.parse(result));
    } catch (error) {
      console.error("Error fetching contest result:", error);
      next(error);
    }
  }

  async submitCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, contestId, problemId, problemNo, code, language } =
        req.body;

      const runId = nanoid(10);

      const payload = {
        runId,
        userId,
        contestId,
        problemId,
        problemNo,
        code,
        language,
        timestamp: new Date().toISOString(),
      };

      const kafkaService = KafkaService.getInstance();
      const producer = await kafkaService.getProducer();

      await producer.send({
        topic: "code-submit-requests",
        messages: [
          {
            key: runId,
            value: JSON.stringify(payload),
          },
        ],
      });

      res.status(HttpStatusCode.ACCEPTED).json({
        status: "processing",
        message: "Code submitted successfully",
        runId,
      });
    } catch (error) {
      console.error("Error in submitCode:", error);
      next(error);
    }
  }

  async getSubmitCodeResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { runId } = req.query;

      if (!runId) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Missing required query parameter" });
        return;
      }

      const key = `submitCode:${runId}`;

      const result = await redisService.get(key);

      if (!result) {
        res.status(HttpStatusCode.NOT_FOUND).json({ message: "processing" });
        return;
      }

      res.status(HttpStatusCode.SUCCESS).json(JSON.parse(result));
    } catch (error) {
      console.error("Error fetching contest result:", error);
      next(error);
    }
  }

  async getContestLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { contestId, page } = req.query;

      const leaderboardData = await redisService.getContestLeaderboard(
        contestId as string,
        Number(page)
      );

      const userIds = leaderboardData.map((entry) => entry.userId);

      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true },
      });

      const userMap = users.reduce(
        (map, user) => ({ ...map, [user.id]: user.username }),
        {}
      );

      const leaderboardWithUsernames = leaderboardData.map((entry) => ({
        username: userMap[entry.userId] || "Unknown User",
        score: entry.score,
        details: entry.details,
      }));

      const pageNumber = parseInt(page as string, 10);
      const key = `contestPerformance:${contestId}`;
      const totalMembers = (await redisService.zCard(key)) || 0;
      const totalPages = Math.ceil(totalMembers / 10);

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: leaderboardWithUsernames,
        pagination: {
          pageNumber,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
