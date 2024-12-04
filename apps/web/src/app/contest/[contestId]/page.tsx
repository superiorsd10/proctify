import { notFound } from "next/navigation";
import Link from "next/link";
import { ContestDetails } from "src/components/ContestDetails";
import { ProblemList } from "src/components/ProblemList";
import { getContestById } from "src/lib/contests";
import { ProctoringContestMonitor } from "src/components/ProctoringContestMonitor";

export default async function ContestPage({
  params,
}: {
  params: { contestId: string };
}) {
  const contest = await getContestById(params.contestId);

  console.log("Fetched contest:", contest);
  console.log("Contest problems:", contest?.problems);

  if (!contest) {
    notFound();
  }

  return (
    <ProctoringContestMonitor code={params.contestId}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="container mx-auto p-4 max-w-2xl">
          <ContestDetails contest={contest} />
          <ProblemList
            problems={contest.problems}
            contestId={params.contestId}
          />
          <div className="mt-4 text-center">
            <Link
              href={`/contest/${params.contestId}/leaderboard`}
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </ProctoringContestMonitor>
  );
}
