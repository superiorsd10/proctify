"use client";
import React, { useEffect, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { useDetection } from "../hooks/useDetection";
import { useToast } from "@repo/ui/components/hooks/use-toast";

export const ProctoringMonitor: React.FC = () => {
  const { toast } = useToast();
  const { webcamRef, canvasRef, isLoading, violations, runDetection } =
    useDetection({
      noiseThreshold: 60,
      objectThreshold: 0.4,
    });

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
    <div className="relative">
      <Webcam
        ref={webcamRef}
        className="rounded-md w-full"
        audio={false}
        mirrored={true}
        videoConstraints={{
          width: 1280,
          height: 720,
          facingMode: "user",
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-50 w-full"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
};
