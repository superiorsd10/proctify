// apps/web/src/app/hooks/detection/useBrowserViolations.ts
import { useCallback } from "react";
import { useEventListener } from "./useEventListener";
import { DetectionOptions } from "src/types/detectionTypes";

export const useBrowserViolations = (options: DetectionOptions) => {
  const handleVisibilityChange = useCallback(() => {
    if (typeof document !== "undefined" && document.hidden) {
      options.onBrowserViolation?.({
        type: "tab",
        timestamp: Date.now(),
      });
    }
  }, [options]);

  const handleWindowFocus = useCallback(() => {
    if (typeof document !== "undefined" && !document.hasFocus()) {
      options.onBrowserViolation?.({
        type: "window",
        timestamp: Date.now(),
      });
    }
  }, [options]);

  const handleRightClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      options.onBrowserViolation?.({
        type: "rightclick",
        timestamp: Date.now(),
      });
    },
    [options]
  );

  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (["c", "v", "x"].includes(e.key.toLowerCase())) {
          e.preventDefault();
          options.onBrowserViolation?.({
            type: "copypaste",
            timestamp: Date.now(),
          });
        }
      }

      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        options.onBrowserViolation?.({
          type: "tab",
          timestamp: Date.now(),
        });
      }
    },
    [options]
  );

  useEventListener("visibilitychange", handleVisibilityChange);
  useEventListener("blur", handleWindowFocus);
  useEventListener("contextmenu", handleRightClick);
  useEventListener("keydown", handleKeydown);
};
