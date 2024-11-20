import { ProctoringMonitor } from "@/components/ProctoringMonitor";

export default function ProctoringPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Proctoring Session</h1>
      <ProctoringMonitor />
    </div>
  );
}
