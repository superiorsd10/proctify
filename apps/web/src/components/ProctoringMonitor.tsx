"use client";
import React, { useEffect, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { useDetection } from "../hooks/detection/useDetection";
import { useToast } from "@repo/ui/components/hooks/use-toast";
import { BrowserViolation } from "src/types/detectionTypes";

export function ProctoringMonitor({ url }: { url: string }) {
  const { toast } = useToast();

  const handleBrowserViolation = useCallback(
    (violation: BrowserViolation) => {
      let violationMessage = "";

      switch (violation.type) {
        case "fullscreen":
          violationMessage = "Attempted to exit full-screen mode";
          break;
        case "rightclick":
          violationMessage = "Right-click detected";
          break;
        case "copypaste":
          violationMessage = "Copy-paste attempt detected";
          break;
        case "tab":
          violationMessage = "Tab switching attempt detected";
          break;
        case "window":
          violationMessage = "Window switching attempt detected";
          break;
      }

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

  // Request fullscreen on mount
  useEffect(() => {
    enterFullscreen();
  }, [enterFullscreen]);

  // Keep track of previous violations
  const previousViolationsRef = useRef<string[]>([]);

  const processDetection = useCallback(async () => {
    const currentViolations = await runDetection();

    // Only show toasts for new violations that weren't present in the previous check
    const newViolations = currentViolations.filter(
      (violation) => !previousViolationsRef.current.includes(violation)
    );

    // Show toasts for new violations only
    newViolations.forEach((violation) => {
      toast({
        variant: "destructive",
        title: "Proctoring Violation",
        description: violation,
      });
    });

    // Update previous violations for next comparison
    previousViolationsRef.current = currentViolations;
  }, [runDetection, toast]);

  useEffect(() => {
    const detectionInterval = setInterval(processDetection, 3000);
    return () => clearInterval(detectionInterval);
  }, [processDetection]);

  if (isLoading) return <div>Loading Detection Model...</div>;

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 left-4 z-50">
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
      <iframe
        ref={canvasRef}
        src={url}
        className="w-full h-full border-none"
        title="Test"
      />
    </div>
  );
}
