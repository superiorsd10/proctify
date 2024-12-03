"use client";

import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetTime: Date;
}

export function CountdownTimer({ targetTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("Test has started!");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <div className="text-center p-4 bg-primary text-primary-foreground rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Time until test starts:</h2>
      <p className="text-4xl font-mono">{timeLeft}</p>
    </div>
  );
}
