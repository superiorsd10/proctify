import ReactMarkdown from "react-markdown";
import { Problem } from "src/types/contest";

export function ProblemDetails({
  problem,
  description,
}: {
  problem: Problem;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-2">
        Problem {problem.id}: {problem.points} points
      </h2>
      <div className="prose max-w-none">
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-bold mb-2">Sample Input</h3>
        <pre className="bg-gray-100 p-2 rounded">{problem.sampleInput}</pre>
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-bold mb-2">Sample Output</h3>
        <pre className="bg-gray-100 p-2 rounded">{problem.sampleOutput}</pre>
      </div>
    </div>
  );
}
