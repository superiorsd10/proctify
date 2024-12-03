"use client";

import React, { useEffect, useState } from "react";
import { ProctoringMonitor } from "src/components/ProctoringMonitor";
import { CountdownTimer } from "./countdown-timer";

export function ProctoringContent({
  url,
  startTime,
}: {
  url: string;
  startTime: string;
}) {
  const [proctoringEnabled, setProctoringEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const testStartTime = new Date(startTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentTime >= testStartTime) {
      setProctoringEnabled(true);
    }
  }, [currentTime, testStartTime]);

  if (!proctoringEnabled) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <CountdownTimer targetTime={testStartTime} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 z-10">
        <ProctoringMonitor url={url} />
      </div>
    </div>
  );
}
