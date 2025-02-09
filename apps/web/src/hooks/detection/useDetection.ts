"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import * as blazeface from "@tensorflow-models/blazeface";
import Webcam from "react-webcam";
import { DetectionOptions, Prediction } from "src/types/detectionTypes";
import { useFullScreen } from "./useFullScreen";
import { useAudioDetection } from "./useAudioDetection";
import { useBrowserViolations } from "./useBrowserViolations";
import {
  DEFAULT_PROHIBITED_OBJECTS,
  DEFAULT_OBJECT_THRESHOLD,
  DEFAULT_NOISE_THRESHOLD,
  PERSON_ABSENCE_THRESHOLD,
} from "src/constants/detectionConstants";

export const useDetection = (options: DetectionOptions = {}) => {
  const {
    objectThreshold = DEFAULT_OBJECT_THRESHOLD,
    noiseThreshold = DEFAULT_NOISE_THRESHOLD,
    prohibitedObjects = DEFAULT_PROHIBITED_OBJECTS,
  } = options;

  const [isLoading, setIsLoading] = useState(true);
  const [violations, setViolations] = useState<
    { type: string; message: string }[]
  >([]);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [personPresent, setPersonPresent] = useState(true);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLIFrameElement>(null);
  const modelRef = useRef<any>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const personAbsentStartTime = useRef<number | null>(null);
  const faceModelRef = useRef<any>(null);

  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullScreen(
    options.onBrowserViolation
  );

  const {
    initializeAudio,
    calculateNoiseLevel,
    cleanup: cleanupAudio,
  } = useAudioDetection();

  useBrowserViolations(options);

  const checkPersonPresence = useCallback(
    (predictions: Prediction[]) => {
      const personDetected = predictions.some(
        (prediction) => prediction.class.toLowerCase() === "person"
      );

      if (!personDetected) {
        // Person is absent
        if (!personAbsentStartTime.current) {
          // Start tracking absence time
          personAbsentStartTime.current = Date.now();
        }

        // Check if absence duration exceeds threshold
        const absenceDuration =
          Date.now() - (personAbsentStartTime.current || 0);
        if (absenceDuration >= PERSON_ABSENCE_THRESHOLD && personPresent) {
          setPersonPresent(false);
          return true; // Should generate violation
        }
      } else {
        // Person is present, reset tracking
        personAbsentStartTime.current = null;
        if (!personPresent) {
          setPersonPresent(true);
        }
      }
      return false; // No violation
    },
    [personPresent]
  );

  const runDetection = useCallback(async () => {
    const currentViolations: { type: string; message: string }[] = [];

    // Object Detection
    if (modelRef.current && webcamRef.current) {
      const video = webcamRef.current.video;
      if (video && video.readyState === 4) {
        const predictions = await modelRef.current.detect(
          video,
          5,
          objectThreshold
        );

        console.log("Predictions:", predictions);

        // Face Detection
        if (faceModelRef.current) {
          const faces = await faceModelRef.current.estimateFaces(video);

          console.log("Detected Faces:", faces);

          // Check for multiple faces
          if (faces && faces.length > 1) {
            currentViolations.push({
              type: "multipleFaceViolations",
              message: `Multiple faces detected: ${faces.length} faces in the frame`,
            });
          }
        }

        // Check for prohibited objects
        predictions.forEach((prediction: Prediction) => {
          const detectedClass = prediction.class.toLowerCase();
          if (prohibitedObjects.some((obj) => detectedClass.includes(obj))) {
            currentViolations.push({
              type: "prohibitedObjectViolations",
              message: `Prohibited object detected: ${prediction.class} (${(prediction.score * 100).toFixed(2)}%)`,
            });
          }
        });

        // Check for person presence
        const personAbsent = checkPersonPresence(predictions);
        if (personAbsent) {
          currentViolations.push({
            type: "noFaceViolations",
            message: `No person detected in frame for more than ${PERSON_ABSENCE_THRESHOLD / 1000} seconds`,
          });
        }
      }
    }

    // Audio Detection
    const currentNoiseLevel = calculateNoiseLevel();
    setNoiseLevel(currentNoiseLevel);

    console.log("Current Noise Level:", currentNoiseLevel);

    if (currentNoiseLevel > noiseThreshold) {
      currentViolations.push({
        type: "audioViolations",
        message: `Noise level too high: ${currentNoiseLevel}dB (threshold: ${noiseThreshold}dB)`,
      });
    }

    setViolations(currentViolations);
    return currentViolations;
  }, [
    objectThreshold,
    noiseThreshold,
    prohibitedObjects,
    calculateNoiseLevel,
    checkPersonPresence,
  ]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        modelRef.current = await cocoSSDLoad();
        faceModelRef.current = await blazeface.load();
        await initializeAudio();
        setIsLoading(false);
      } catch (error) {
        console.error("Initialization failed:", error);
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      cleanupAudio();
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return {
    webcamRef,
    canvasRef,
    isLoading,
    violations,
    noiseLevel,
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    runDetection,
  };
};
