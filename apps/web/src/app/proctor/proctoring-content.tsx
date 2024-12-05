"use client";

import React, { useEffect, useState } from "react";
import { CountdownTimer } from "./countdown-timer";
import { ProctoringMonitor } from "src/components/ProctoringMonitor";

export function ProctoringContent({
  url,
  startTime,
  code,
}: {
  url: string;
  startTime: string;
  code: string;
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
    <ProctoringMonitor code={code}>
      <iframe src={url} className="w-full h-full border-none" title="Test" />
    </ProctoringMonitor>
  );
}
