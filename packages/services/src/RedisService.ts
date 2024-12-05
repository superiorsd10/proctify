import { createClient, RedisClientType } from "redis";

export class RedisService {
  private static instance: RedisService;
  private client: RedisClientType;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    this.client.on("error", (err) => console.error("Redis Client Error", err));

    this.client.connect().catch((err) => {
      console.error("Failed to connect to Redis:", err);
    });
  }

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async zCard(key: string): Promise<number | null> {
    return await this.client.zCard(key);
  }

  getClient(): RedisClientType {
    return this.client;
  }

  async updateContestPerformance(
    contestId: string,
    userId: string,
    problemId: number,
    solvedTime: number,
    points: number
  ): Promise<void> {
    const key = `contestPerformance:${contestId}`;

    try {
      const existingProblemSolve = await this.client.hGet(
        `${key}:problemSolves`,
        `${userId}:${problemId}`
      );

      if (existingProblemSolve) {
        return;
      }

      await this.client.hSet(
        `${key}:problemSolves`,
        `${userId}:${problemId}`,
        "solved"
      );

      await this.client.zIncrBy(key, points, userId);

      const performanceKey = `${key}:details`;
      await this.client.hIncrBy(
        performanceKey,
        `${userId}:totalPoints`,
        points
      );
      await this.client.hIncrBy(performanceKey, `${userId}:problemsSolved`, 1);
      await this.client.hIncrBy(
        performanceKey,
        `${userId}:totalSolveTime`,
        solvedTime
      );
    } catch (error) {
      console.error(`Error updating contest performance for ${key}:`, error);
    }
  }

  async getContestLeaderboard(
    contestId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<Array<{ userId: string; score: number; details: any }>> {
    const key = `contestPerformance:${contestId}`;
    const performanceKey = `${key}:details`;

    try {
      const start = (page - 1) * pageSize;
      const stop = start + pageSize - 1;

      const topPerformers = await this.client.zRangeWithScores(
        key,
        start,
        stop,
        { REV: true }
      );

      const performersArray = topPerformers.map(({ value, score }) => ({
        userId: value,
        score: score,
      }));

      const leaderboard = await Promise.all(
        performersArray.map(async ({ userId, score }) => {
          const details = await this.client.hGetAll(performanceKey);

          return {
            userId,
            score,
            details: {
              totalPoints: parseInt(
                details[`${userId}:totalPoints`] || "0",
                10
              ),
              problemsSolved: parseInt(
                details[`${userId}:problemsSolved`] || "0",
                10
              ),
              totalSolveTime: parseInt(
                details[`${userId}:totalSolveTime`] || "0",
                10
              ),
            },
          };
        })
      );

      return leaderboard;
    } catch (error) {
      console.error(`Error retrieving contest leaderboard for ${key}:`, error);
      return [];
    }
  }
}
