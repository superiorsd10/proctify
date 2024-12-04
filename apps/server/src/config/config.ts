import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  kafkaBroker: process.env.KAFKA_BROKER || "localhost:9092",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
  bucketName: process.env.AWS_S3_BUCKET_NAME,
};

export default config;
