"use client"

import { useEffect, useState } from "react";
import { Contest } from "src/types/contest";

export function ContestDetails({ contest }: { contest: Contest }) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const end = new Date(start.getTime() + contest.duration * 60000);

      if (now < start) {
        const diff = start.getTime() - now.getTime();
        setTimeRemaining(`Starts in ${formatTime(diff)}`);
      } else if (now < end) {
        const diff = end.getTime() - now.getTime();
        setTimeRemaining(`Ends in ${formatTime(diff)}`);
      } else {
        setTimeRemaining("Contest has ended");
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">{contest.title}</h1>
      <p className="text-xl mb-2">{timeRemaining}</p>
      <p>Duration: {contest.duration} minutes</p>
    </div>
  );
}
