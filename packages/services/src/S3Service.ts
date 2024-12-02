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

  async getFile(bucket: string, key: string): Promise<S3.GetObjectOutput> {
    return this.s3.getObject({ Bucket: bucket, Key: key }).promise();
  }
}
