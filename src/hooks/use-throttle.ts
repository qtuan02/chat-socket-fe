import * as React from "react";

type ThrottledCallbackResult<TArgs extends unknown[], TResult> = {
  throttle: (...args: TArgs) => TResult | undefined;
  isThrottling: boolean;
  clear: () => void;
};

export function useThrottle<TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => TResult,
  delay = 500,
): ThrottledCallbackResult<TArgs, TResult> {
  const [isThrottling, setIsThrottling] = React.useState(false);
  const callbackRef = React.useRef(callback);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLockedRef = React.useRef(false);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clearThrottle = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    isLockedRef.current = false;
    setIsThrottling(false);
  }, []);

  React.useEffect(() => {
    return clearThrottle;
  }, [clearThrottle]);

  const throttled = React.useCallback(
    (...args: TArgs): TResult | undefined => {
      if (isLockedRef.current) {
        return undefined;
      }

      isLockedRef.current = true;
      setIsThrottling(true);

      timerRef.current = setTimeout(() => {
        isLockedRef.current = false;
        setIsThrottling(false);
      }, delay);

      return callbackRef.current(...args);
    },
    [delay],
  );

  return {
    throttle: throttled,
    isThrottling,
    clear: clearThrottle,
  };
}
