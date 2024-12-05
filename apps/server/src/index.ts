import http from "http";
import { Express } from "express";
import config from "./config/config";
import { KafkaService, RedisService } from "@repo/services";

const PORT = config.port;

async function startServer() {
  try {
    const { default: createApp } = await import("./app");
    const app: Express = createApp();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.info(`Server is running on PORT: ${PORT}`);
    });

    const shutdown = (signal: string) => {
      console.info(`${signal} received`);
      console.info("Closing http server...");

      server.close(async () => {
        console.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    await startKafkaConsumer();
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

async function startKafkaConsumer() {
  try {
    const kafkaService = KafkaService.getInstance();
    const consumer = await kafkaService.getConsumer("result-service");
    const redisService = RedisService.getInstance();

    await consumer.subscribe({
      topics: ["code-run-results", "code-submit-results"],
    });

    console.log("Consumer listening to Kafka topic: code-run-results");

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          if (!message.value) {
            return;
          }

          if (topic === "code-run-results") {
            const result = JSON.parse(message.value.toString());
            const key = `runCode:${result.runId}`;

            console.log("Storing result in Redis:", key, result);
            await redisService.set(key, JSON.stringify(result.result));
          } else if (topic === "code-submit-results") {
            const result = JSON.parse(message.value.toString());
            const key = `submitCode:${result.runId}`;

            console.log("Storing result in Redis:", key, result);
            await redisService.set(key, JSON.stringify(result.result));

            await prisma?.submission.create({
              data: {
                userId: result.userId,
                contestId: result.contestId,
                problemId: parseInt(result.problemId),
                problemNo: parseInt(result.problemNo),
                submittedTime: new Date(result.timestamp),
                solvedTime: getDateDifferenceInSecondsParse(
                  result.timestamp,
                  result.startTime
                ),
                status: result.result.status.description,
                code: result.code,
                language: result.language,
              },
            });

            if (result.result.status.description === "Accepted") {
              await redisService.updateContestPerformance(
                result.contestId,
                result.userId,
                result.problemId,
                getDateDifferenceInSecondsParse(
                  result.timestamp,
                  result.startTime
                ),
                result.points
              );
            }
          }
        } catch (error) {
          console.error("Error processing result:", error);
        }
      },
    });
  } catch (error) {
    console.error("Error starting Kafka consumer:", error);
  }
}

function getDateDifferenceInSecondsParse(date1: string, date2: string): number {
  const time1 = Date.parse(date1);
  const time2 = Date.parse(date2);

  return Math.abs(Math.floor((time1 - time2) / 1000));
}

startServer();
