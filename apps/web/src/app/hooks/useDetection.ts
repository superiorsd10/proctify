"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";

interface DetectionOptions {
  objectThreshold?: number;
  noiseThreshold?: number;
  prohibitedObjects?: string[];
}

interface Prediction {
  class: string;
  score: number;
}

interface extWindow extends Window {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
}

declare let window: extWindow;

export const useDetection = (options: DetectionOptions = {}) => {
  const {
    objectThreshold = 0.4,
    noiseThreshold = 60,
    prohibitedObjects = [
      "cell phone",
      "mobile phone",
      "phone",
      "laptop",
      "tablet",
      "computer",
    ],
  } = options;

  const [isLoading, setIsLoading] = useState(true);
  const [violations, setViolations] = useState<string[]>([]);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [personPresent, setPersonPresent] = useState(true);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const personAbsentStartTime = useRef<number | null>(null);

  const PERSON_ABSENCE_THRESHOLD = 6000;

  const initializeDetection = useCallback(async () => {
    try {
      // TensorFlow Model
      await tf.setBackend("webgl");
      await tf.ready();
      const model = await cocoSSDLoad();
      modelRef.current = model;

      // Audio Detection
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContextRef.current.createAnalyser();
      const microphone =
        audioContextRef.current.createMediaStreamSource(stream);

      microphone.connect(analyser);
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      setIsLoading(false);
    } catch (error) {
      console.error("Initialization failed:", error);
      setIsLoading(false);
    }
  }, []);

  const calculateNoiseLevel = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += (dataArray[i] - 128) * (dataArray[i] - 128);
      }

      const average = sum / dataArray.length;
      const volumeInDb = 20 * Math.log10(Math.sqrt(average) / 128);
      const adjustedVolumeInDb = volumeInDb + 100; // Adjust base level

      return Math.max(0, Number(adjustedVolumeInDb.toFixed(0)));
    }
    return 0;
  }, []);

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
    const currentViolations: string[] = [];

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

        // Check for prohibited objects
        predictions.forEach((prediction: Prediction) => {
          const detectedClass = prediction.class.toLowerCase();
          if (prohibitedObjects.some((obj) => detectedClass.includes(obj))) {
            currentViolations.push(
              `Prohibited object detected: ${prediction.class} (${(prediction.score * 100).toFixed(2)}%)`
            );
          }
        });

        // Check for person presence
        const personAbsent = checkPersonPresence(predictions);
        if (personAbsent) {
          currentViolations.push(
            `No person detected in frame for more than ${PERSON_ABSENCE_THRESHOLD / 1000} seconds`
          );
        }
      }
    }

    // Audio Detection
    const currentNoiseLevel = calculateNoiseLevel();
    setNoiseLevel(currentNoiseLevel);

    console.log("Current Noise Level:", currentNoiseLevel);

    if (currentNoiseLevel > noiseThreshold) {
      currentViolations.push(
        `Noise level too high: ${currentNoiseLevel}dB (threshold: ${noiseThreshold}dB)`
      );
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
    initializeDetection();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [initializeDetection]);

  return {
    webcamRef,
    canvasRef,
    isLoading,
    violations,
    noiseLevel,
    personPresent,
    runDetection,
  };
};
