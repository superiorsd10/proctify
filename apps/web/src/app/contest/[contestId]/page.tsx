"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ContestDetails } from "src/components/ContestDetails";
import { ProblemList } from "src/components/ProblemList";
import { getContestById } from "src/lib/contests";
import { ProctoringContestMonitor } from "src/components/ProctoringContestMonitor";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";

export default function ContestPage({
  params,
}: {
  params: { contestId: string };
}) {
  const [contest, setContest] = useState<any>(null);
  const [hasContestStarted, setHasContestStarted] = useState(false);

  useEffect(() => {
    async function fetchContest() {
      const fetchedContest = await getContestById(params.contestId);
      if (!fetchedContest) {
        notFound();
        return;
      }
      setContest(fetchedContest);

      // Check and update if the contest has started
      const contestStartTime = new Date(fetchedContest.startTime);
      setHasContestStarted(new Date() >= contestStartTime);
    }

    fetchContest();

    const interval = setInterval(() => {
      if (contest) {
        const contestStartTime = new Date(contest.startTime);
        setHasContestStarted(new Date() >= contestStartTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  if (!contest) {
    return null;
  }

  return (
    <ProctoringContestMonitor code={params.contestId}>
      <div className="flex items-center justify-center min-h-screen py-8">
        <div className="container mx-auto p-4 max-w-3xl">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <ContestDetails contest={contest} />
              <div className="my-8" />

              {hasContestStarted ? (
                <>
                  <ProblemList
                    problems={contest.problems}
                    contestId={params.contestId}
                  />
                  <div className="mt-8 text-center">
                    <Button asChild>
                      <Link href={`/contest/${params.contestId}/leaderboard`}>
                        View Leaderboard
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-lg font-medium text-gray-600">
                  The contest has not started yet. Please wait until the start
                  time to view problems and leaderboard.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProctoringContestMonitor>
  );
}
