import { useCallback, useEffect, useRef } from "react";

const useDebouncedCallback = <T extends (...args: any[]) => any>(
  func: T,
  delay = 500
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const funcRef = useRef(func);
  funcRef.current = func;

  const callback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        funcRef.current(...args);
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return callback as T;
};

export default useDebouncedCallback;
