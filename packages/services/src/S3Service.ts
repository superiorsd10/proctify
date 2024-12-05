import { S3 } from "aws-sdk";

export class S3Service {
  private static instance: S3Service;
  private s3: S3;

  private constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || "us-east-1",
    });
  }

  static getInstance(): S3Service {
    if (!S3Service.instance) {
      S3Service.instance = new S3Service();
    }
    return S3Service.instance;
  }

  async generatePresignedUrl(
    bucket: string,
    key: string,
    expiresIn = 3600
  ): Promise<string> {
    return this.s3.getSignedUrlPromise("putObject", {
      Bucket: bucket,
      Key: key,
      Expires: expiresIn,
    });
  }

  async uploadWithPresignedUrl(
    bucket: string,
    key: string,
    content: string,
    expiresIn = 3600
  ): Promise<string> {
    const presignedUrl = await this.generatePresignedUrl(
      bucket,
      key,
      expiresIn
    );

    await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
      body: content,
    });

    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
}
