import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";

type Log = {
  username: string;
  audioViolations: number;
  noFaceViolations: number;
  multipleFaceViolations: number;
  keypressViolations: number;
  rightClickViolations: number;
  windowChangeViolations: number;
  prohibitedObjectViolations: number;
  ufmScore: number;
};

export function LogTable({ logs }: { logs: Log[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Audio</TableHead>
          <TableHead>No Face</TableHead>
          <TableHead>Multiple Faces</TableHead>
          <TableHead>Keypress</TableHead>
          <TableHead>Right Click</TableHead>
          <TableHead>Window Change</TableHead>
          <TableHead>Prohibited Object</TableHead>
          <TableHead>UFM Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.username}>
            <TableCell>{log.username}</TableCell>
            <TableCell>{log.audioViolations}</TableCell>
            <TableCell>{log.noFaceViolations}</TableCell>
            <TableCell>{log.multipleFaceViolations}</TableCell>
            <TableCell>{log.keypressViolations}</TableCell>
            <TableCell>{log.rightClickViolations}</TableCell>
            <TableCell>{log.windowChangeViolations}</TableCell>
            <TableCell>{log.prohibitedObjectViolations}</TableCell>
            <TableCell>{log.ufmScore}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
