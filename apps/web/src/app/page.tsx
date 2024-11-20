import { Button } from "@repo/ui/components/ui/button";

export default function Page(): JSX.Element {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
      <Button variant="destructive">Destructive</Button>
    </main>
  );
}
