import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="space-x-4">
        <Link href="/create-test">
          <Button variant="default">Create Test</Button>
        </Link>
        <Button variant="outline">Join Test</Button>
      </div>
    </div>
  );
}
