import { ProctoringContent } from "./proctoring-content";

export default function ProctoringPage({
  searchParams,
}: {
  searchParams: { url?: string; startTime?: string };
}) {
  const { url, startTime } = searchParams;

  if (!url || !startTime) {
    return <div>Missing URL or start time</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProctoringContent url={url} startTime={startTime} />
    </div>
  );
}
