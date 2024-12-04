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
    return <p>No problems available for this contest.</p>;
  }

  const sortedProblems = [...problems].sort((a, b) => a.points - b.points);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Problems</h2>
      <ul className="space-y-2">
        {sortedProblems.map((problem, index) => (
          <li key={problem.id}>
            <Link
              href={`/contest/${contestId}/problems/${index + 1}`}
              className="text-blue-500 hover:underline"
            >
              Problem {index + 1}: {problem.points} points
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
