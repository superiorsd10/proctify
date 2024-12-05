"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleCreateContest = () => {
    const contestId = nanoid(10);
    router.push(`/create-contest/${contestId}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="space-y-6 text-center">
        <div className="flex space-x-4 justify-center">
          <Link href="/create-test">
            <Button variant="default" className="w-40">
              Create Test
            </Button>
          </Link>
          <Link href="/join-test">
            <Button variant="outline" className="w-40">
              Join Test
            </Button>
          </Link>
        </div>

        <div className="flex space-x-4 justify-center">
          <Button variant="default" className="w-40" onClick={handleCreateContest}>
            Create Contest
          </Button>
          <Link href="/join-contest">
            <Button variant="outline" className="w-40">
              Join Contest
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
