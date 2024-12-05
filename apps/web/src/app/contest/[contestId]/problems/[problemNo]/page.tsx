import { notFound } from "next/navigation";
import Link from "next/link";
import { ProctoringContestMonitor } from "src/components/ProctoringContestMonitor";
import { ProblemDetails } from "src/components/ProblemDetails";
import { CodeEditor } from "src/components/CodeEditor";
import { getContestById } from "src/lib/contests";
import { getProblemDescription } from "src/lib/problems";

export default async function ProblemPage({
  params,
}: {
  params: { contestId: string; problemNo: string };
}) {
  const contest = await getContestById(params.contestId);

  if (!contest) {
    notFound();
  }

  const problemIndex = parseInt(params.problemNo) - 1;
  const problem = contest.problems[problemIndex];

  if (!problem) {
    notFound();
  }

  const description = await getProblemDescription(
    params.contestId,
    params.problemNo
  );

  return (
    <ProctoringContestMonitor code={params.contestId}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{contest.title}</h1>
        <ProblemDetails problem={problem} description={description} />
        <CodeEditor
          problemId={String(problem.id)}
          problemNo={params.problemNo}
          contestId={params.contestId}
          sampleInput={problem.sampleInput}
          sampleOutput={problem.sampleOutput}
        />
        <div className="mt-4 flex space-x-4">
          {problemIndex > 0 && (
            <Link
              href={`/contest/${params.contestId}/problems/${problemIndex}`}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Previous Problem
            </Link>
          )}
          {problemIndex < contest.problems.length - 1 && (
            <Link
              href={`/contest/${params.contestId}/problems/${problemIndex + 2}`}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Next Problem
            </Link>
          )}
        </div>
      </div>
    </ProctoringContestMonitor>
  );
}
