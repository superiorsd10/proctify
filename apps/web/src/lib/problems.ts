import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getProblemDescription(
  contestId: string,
  problemNo: string
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;
  const key = `problems/${contestId}/${problemNo}.md`;

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    const str = await response.Body?.transformToString();
    return str || "";
  } catch (error) {
    console.error("Error fetching problem description:", error);
    return "Error: Unable to load problem description.";
  }
}
