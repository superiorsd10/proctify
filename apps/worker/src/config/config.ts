import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  kafkaBroker: process.env.KAFKA_BROKER || "localhost:9092",
  judge0BaseUrl: process.env.JUDGE0_BASE_URL,
  kafkaTopicInput: process.env.KAFKA_TOPIC_INPUT,
  kafkaTopicOutput: process.env.KAFKA_TOPIC_OUTPUT,
  kafkaGroupId: process.env.KAFKA_GROUP_ID,
  rapidApiKey: process.env.X_RAPIDAPI_KEY,
  rapidApiHost: process.env.X_RAPIDAPI_HOST,
};

export default config;
