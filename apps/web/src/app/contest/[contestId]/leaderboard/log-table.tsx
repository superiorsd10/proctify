import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";

type Entry = {
  username: string;
  score: number;
  details: {
    totalPoints: number;
    problemsSolved: number;
    totalSolveTime: number;
  };
};

export function LogTable({ logs }: { logs: Entry[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Problem Solved</TableHead>
          <TableHead>Total Solve Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.username}>
            <TableCell>{log.username}</TableCell>
            <TableCell>{log.score}</TableCell>
            <TableCell>{log.details.problemsSolved}</TableCell>
            <TableCell>{secondsToHHMMSS(log.details.totalSolveTime)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function secondsToHHMMSS(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  // Pad single digit minutes and seconds with leading zeros
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
