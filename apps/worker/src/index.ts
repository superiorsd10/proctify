import { KafkaService } from "@repo/services";
import { submitToJudge0 } from "./utils/judge0";
import config from "./config/config";
import { prisma } from "@repo/db";

async function startWorker() {
  try {
    const kafkaService = KafkaService.getInstance();
    const consumer = await kafkaService.getConsumer(
      config.kafkaGroupId as string
    );
    const producer = await kafkaService.getProducer();

    await consumer.subscribe({
      topics: ["code-run-requests", "code-submit-requests"],
    });

    console.log("Worker listening to Kafka topic:", config.kafkaTopicInput);

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          if (!message.value) {
            return;
          }

          if (topic === "code-run-requests") {
            const payload = JSON.parse(message.value.toString());
            const { runId, code, language, input, output } = payload;

            console.log("Processing submission:", runId);

            const languageMap: Record<string, number> = {
              python: 71,
              javascript: 63,
              java: 62,
              cpp: 54,
            };

            const judge0Submission = {
              source_code: code,
              language_id: languageMap[language],
              stdin: input,
              expected_output: output,
            };

            const result = await submitToJudge0(judge0Submission);

            await producer.send({
              topic: config.kafkaTopicOutput as string,
              messages: [
                {
                  key: runId,
                  value: JSON.stringify({ result, runId }),
                },
              ],
            });

            console.log("Result published to Kafka:", result);
          } else if (topic === "code-submit-requests") {
            const payload = JSON.parse(message.value.toString());
            const {
              runId,
              userId,
              contestId,
              problemId,
              problemNo,
              code,
              language,
              timestamp,
            } = payload;

            console.log("Processing submission:", runId);

            const languageMap: Record<string, number> = {
              python: 71,
              javascript: 63,
              java: 62,
              cpp: 54,
            };

            const fileUrls = await prisma.problem.findUnique({
              where: { id: parseInt(problemId) },
              select: {
                inputFileUrl: true,
                outputFileUrl: true,
                points: true,
              },
            });

            const startTime = await prisma.contest.findUnique({
              where: { id: contestId },
              select: {
                startTime: true,
              },
            });

            if (!fileUrls) {
              throw new Error(`Problem with ID ${problemId} not found`);
            }

            const inputResponse = await fetch(fileUrls.inputFileUrl, {
              method: "GET",
              headers: {
                "Content-Type": "text/plain",
              },
            });

            if (!inputResponse.ok) {
              throw new Error(`HTTP error! status: ${inputResponse.status}`);
            }

            const input = await inputResponse.text();

            const outputResponse = await fetch(fileUrls.outputFileUrl, {
              method: "GET",
              headers: {
                "Content-Type": "text/plain",
              },
            });

            if (!outputResponse.ok) {
              throw new Error(`HTTP error! status: ${outputResponse.status}`);
            }

            const output = await outputResponse.text();

            const judge0Submission = {
              source_code: code,
              language_id: languageMap[language],
              stdin: input,
              expected_output: output,
            };

            const result = await submitToJudge0(judge0Submission);

            await producer.send({
              topic: "code-submit-results",
              messages: [
                {
                  key: runId,
                  value: JSON.stringify({
                    result,
                    runId,
                    userId,
                    contestId,
                    problemId,
                    problemNo,
                    timestamp,
                    code,
                    language,
                    points: fileUrls.points,
                    startTime: startTime?.startTime.toISOString(),
                  }),
                },
              ],
            });

            console.log("Result published to Kafka:", result);
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      },
    });
  } catch (error) {
    console.error("Failed to start worker:", error);
  }
}

startWorker();
