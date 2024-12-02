import { Kafka, Producer, Consumer } from "kafkajs";

export class KafkaService {
  private static instance: KafkaService;
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;

  private constructor() {
    this.kafka = new Kafka({
      clientId: "proctify-kafka",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });
  }

  static getInstance(): KafkaService {
    if (!KafkaService.instance) {
      KafkaService.instance = new KafkaService();
    }
    return KafkaService.instance;
  }

  async getProducer(): Promise<Producer> {
    if (!this.producer) {
      this.producer = this.kafka.producer();
      await this.producer.connect();
    }
    return this.producer;
  }

  async getConsumer(groupId: string): Promise<Consumer> {
    if (!this.consumer) {
      this.consumer = this.kafka.consumer({ groupId });
      await this.consumer.connect();
    }
    return this.consumer;
  }
}
