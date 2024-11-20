"use client";
import React, { useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useDetection } from '../hooks/useDetection';
import { useToast } from "@repo/ui/components/hooks/use-toast";

export const ProctoringMonitor: React.FC = () => {
  const { toast } = useToast();
  const {
    webcamRef, 
    canvasRef, 
    isLoading, 
    violations,
    runDetection
  } = useDetection();

  const processDetection = useCallback(async () => {
    const detectedViolations = await runDetection();
    
    if (detectedViolations.length > 0) {
      detectedViolations.forEach(violation => {
        toast({
          variant: "destructive",
          title: "Proctoring Violation",
          description: violation,
        });
      });
    }
  }, [runDetection, toast]);

  useEffect(() => {
    const detectionInterval = setInterval(processDetection, 1500);
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
          facingMode: "user"
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-50 w-full"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};