import Link from "next/link";
import { Problem } from "src/types/contest";

export function ProblemList({
  problems,
  contestId,
}: {
  problems: Problem[];
  contestId: string;
}) {
  if (!problems || problems.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        No problems available for this contest.
      </p>
    );
  }

  const sortedProblems = [...problems].sort((a, b) => a.points - b.points);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">Problems</h2>
      <ul className="space-y-3">
        {sortedProblems.map((problem, index) => (
          <li key={problem.id} className="border border-gray-200 p-3 rounded">
            <Link
              href={`/contest/${contestId}/problems/${index + 1}`}
              className="flex items-center justify-between text-sm"
            >
              <span>Problem {index + 1}</span>
              <span>{problem.points} points</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
