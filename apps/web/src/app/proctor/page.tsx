import { ProctoringContent } from "./proctoring-content";

export default function ProctoringPage({
  searchParams,
}: {
  searchParams: { url?: string; startTime?: string; code?: string };
}) {
  const { url, startTime, code } = searchParams;

  if (!url || !startTime || !code) {
    return <div>Missing URL or start time or code</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProctoringContent url={url} startTime={startTime} code={code} />
    </div>
  );
}
