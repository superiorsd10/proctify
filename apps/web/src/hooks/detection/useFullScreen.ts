import { useState, useCallback } from "react";
import { useEventListener } from "./useEventListener";
import { BrowserViolation } from "src/types/detectionTypes";

export const useFullScreen = (
  onViolation?: (violation: BrowserViolation) => void
) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = useCallback(() => {
    if (typeof document !== "undefined") {
      const fullscreenElement = document.fullscreenElement;
      setIsFullscreen(!!fullscreenElement);

      if (!fullscreenElement && isFullscreen) {
        onViolation?.({
          type: "fullscreen",
          timestamp: Date.now(),
        });
      }
    }
  }, [isFullscreen, onViolation]);

  useEventListener("fullscreenchange", handleFullscreenChange);

  const enterFullscreen = useCallback(async () => {
    if (typeof document !== "undefined") {
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        console.error("Failed to enter fullscreen:", error);
      }
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  return { isFullscreen, enterFullscreen, exitFullscreen };
};
