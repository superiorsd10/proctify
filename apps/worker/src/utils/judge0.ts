import config from "../config/config";

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
}

export async function submitToJudge0(
  submission: Judge0Submission
): Promise<any> {
  try {
    const response = await fetch(`${config.judge0BaseUrl}/submissions`, {
      method: "POST",
      body: JSON.stringify(submission),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await response.json();

    const token = responseData.token;

    let result;
    for (let attempts = 0; attempts < 10; attempts++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const resultResponse = await fetch(
        `${config.judge0BaseUrl}/submissions/${token}`
      );
      result = await resultResponse.json();

      console.log('Result:', result);

      if (result.status.id !== 1 && result.status.id !== 2) {
        break; // Done processing
      }
    }

    return result;
  } catch (error) {
    console.error("Error interacting with Judge0:", error);
    throw new Error("Failed to process code submission");
  }
}
