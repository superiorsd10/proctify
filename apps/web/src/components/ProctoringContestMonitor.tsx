"use client";

import React, { useEffect, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { useDetection } from "../hooks/detection/useDetection";
import { useToast } from "@repo/ui/components/hooks/use-toast";
import { BrowserViolation } from "src/types/detectionTypes";
import { SERVER_BASE_URL } from "src/constants/configurationConstants";
import { useAuth } from "@clerk/nextjs";

export function ProctoringContestMonitor({
  children,
  code,
}: {
  children: React.ReactNode;
  code: string;
}) {
  const { toast } = useToast();
  const violationCountsRef = useRef<Record<string, number>>({});
  const { userId } = useAuth();

  const handleBrowserViolation = useCallback(
    (violation: BrowserViolation) => {
      let violationMessage = "";
      let violationType = "";

      switch (violation.type) {
        case "fullscreen":
          violationMessage = "Attempted to exit full-screen mode";
          violationType = "windowChangeViolations";
          break;
        case "rightclick":
          violationMessage = "Right-click detected";
          violationType = "rightClickViolations";
          break;
        case "copypaste":
          violationMessage = "Copy-paste attempt detected";
          violationType = "keypressViolations";
          break;
        case "tab":
          violationMessage = "Tab switching attempt detected";
          violationType = "windowChangeViolations";
          break;
        case "window":
          violationMessage = "Window switching attempt detected";
          violationType = "windowChangeViolations";
          break;
      }

      violationCountsRef.current[violationType] =
        (violationCountsRef.current[violationType] || 0) + 1;

      toast({
        variant: "destructive",
        title: "Proctoring Violation",
        description: violationMessage,
      });
    },
    [toast]
  );

  const {
    webcamRef,
    canvasRef,
    isLoading,
    violations,
    isFullscreen,
    enterFullscreen,
    runDetection,
  } = useDetection({
    onBrowserViolation: handleBrowserViolation,
  });

  useEffect(() => {
    enterFullscreen();
  }, [enterFullscreen]);

  const previousViolationsRef = useRef<{ type: string; message: string }[]>([]);

  const processDetection = useCallback(async () => {
    const currentViolations = await runDetection();

    currentViolations.forEach((violation) => {
      violationCountsRef.current[violation.type] =
        (violationCountsRef.current[violation.type] || 0) + 1;
    });

    const newViolations = currentViolations.filter(
      (violation) => !previousViolationsRef.current.includes(violation)
    );

    newViolations.forEach((violation) => {
      toast({
        variant: "destructive",
        title: "Proctoring Violation",
        description: violation.message,
      });
    });

    previousViolationsRef.current = currentViolations;
  }, [runDetection, toast]);

  const reportViolations = useCallback(async () => {
    const violationsArray = Object.entries(violationCountsRef.current).map(
      ([type, count]) => ({ type, count })
    );

    if (violationsArray.length > 0) {
      const violationData = {
        userId,
        contestId: code,
        violations: violationsArray,
      };

      try {
        await fetch(`${SERVER_BASE_URL}/contest/update-log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(violationData),
        });
        violationCountsRef.current = {};
      } catch (error) {
        console.error("Error reporting violations", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error reporting violations",
        });
      }
    }
  }, [code, userId, toast]);

  useEffect(() => {
    const detectionInterval = setInterval(processDetection, 3000);
    const reportInterval = setInterval(reportViolations, 10000);
    return () => {
      clearInterval(detectionInterval);
      clearInterval(reportInterval);
    };
  }, [processDetection, reportViolations]);

  if (isLoading) return <div>Loading Detection Model...</div>;

  return (
    <div className="relative w-full h-screen" ref={canvasRef}>
      <div className="absolute top-4 right-4 z-50">
        <Webcam
          ref={webcamRef}
          className="w-48 h-36 rounded-md border border-gray-300"
          audio={false}
          mirrored={true}
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user",
          }}
        />
      </div>
      {children}
    </div>
  );
}
