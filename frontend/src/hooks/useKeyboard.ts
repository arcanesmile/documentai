"use client";
import { useEffect, useCallback } from "react";

type KeyHandler = (event: KeyboardEvent) => void;

export function useKeyboard(
  key: string,
  handler: KeyHandler,
  options?: { ctrl?: boolean; shift?: boolean; alt?: boolean }
): void {
  const { ctrl = false, shift = false, alt = false } = options || {};

  const callback = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.key === key &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt
      ) {
        handler(event);
      }
    },
    [key, handler, ctrl, shift, alt]
  );

  useEffect(() => {
    document.addEventListener("keydown", callback);
    return () => document.removeEventListener("keydown", callback);
  }, [callback]);
}
