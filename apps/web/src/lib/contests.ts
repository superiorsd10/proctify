import { Contest } from "src/types/contest";
import { SERVER_BASE_URL } from "src/constants/configurationConstants";

export async function getContestById(
  contestId: string
): Promise<Contest | null> {
  try {
    const response = await fetch(`${SERVER_BASE_URL}/contest/${contestId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch contest");
    }
    const data = await response.json();
    const contestData: Contest = data.data;

    if (!Array.isArray(contestData.problems)) {
      contestData.problems = [];
    }

    return contestData;
  } catch (error) {
    console.error("Error fetching contest:", error);
    return null;
  }
}
