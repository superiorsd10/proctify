export interface BrowserViolation {
  type: "fullscreen" | "rightclick" | "copypaste" | "tab" | "window";
  timestamp: number;
}

export interface DetectionOptions {
  objectThreshold?: number;
  noiseThreshold?: number;
  prohibitedObjects?: string[];
  onBrowserViolation?: (violation: BrowserViolation) => void;
}

export interface Prediction {
  class: string;
  score: number;
}

interface AudioContextType {
  new (): AudioContext;
}

declare global {
  interface Window {
    AudioContext: AudioContextType;
    webkitAudioContext: AudioContextType;
  }
}
