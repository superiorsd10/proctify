// apps/web/src/app/hooks/detection/useAudioDetection.ts
import { useRef, useCallback } from "react";

export const useAudioDetection = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const initializeAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContextRef.current.createAnalyser();
    const microphone = audioContextRef.current.createMediaStreamSource(stream);

    microphone.connect(analyser);
    analyser.fftSize = 512;
    analyserRef.current = analyser;
  };

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
      const adjustedVolumeInDb = volumeInDb + 100;

      return Math.max(0, Number(adjustedVolumeInDb.toFixed(0)));
    }
    return 0;
  }, []);

  const cleanup = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  return {
    initializeAudio,
    calculateNoiseLevel,
    cleanup,
  };
};
