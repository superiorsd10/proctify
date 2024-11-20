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

export const useDetection = (options: DetectionOptions = {}) => {
  const {
    objectThreshold = 0.4,
    noiseThreshold = 0.1,
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

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const initializeDetection = useCallback(async () => {
    try {
      // TensorFlow Model
      await tf.setBackend("webgl");
      await tf.ready();
      const model = await cocoSSDLoad();
      modelRef.current = model;

      // Audio Detection
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
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

        predictions.forEach((prediction: Prediction) => {
          const detectedClass = prediction.class.toLowerCase();
          if (prohibitedObjects.some((obj) => detectedClass.includes(obj))) {
            currentViolations.push(
              `Prohibited object detected: ${prediction.class} (${(prediction.score * 100).toFixed(2)}%)`
            );
          }
        });
      }
    }

    // Audio Detection
    if (analyserRef.current) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      const averageNoise =
        dataArray.reduce((a, b) => a + b) / bufferLength / 255;
      setNoiseLevel(averageNoise);

      if (averageNoise > noiseThreshold) {
        currentViolations.push(
          `Noise detected: ${(averageNoise * 100).toFixed(2)}%`
        );
      }
    }

    setViolations(currentViolations);
    return currentViolations;
  }, [objectThreshold, noiseThreshold, prohibitedObjects]);

  useEffect(() => {
    initializeDetection();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [initializeDetection]);

  return {
    webcamRef,
    canvasRef,
    isLoading,
    violations,
    noiseLevel,
    runDetection,
  };
};
