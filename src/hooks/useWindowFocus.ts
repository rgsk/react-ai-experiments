import { useEffect, useState } from 'react';

export function useWindowFocus() {
  const [isWindowFocused, setIsWindowFocused] = useState(
    getInitialFocusState()
  );

  useEffect(() => {
    setIsWindowFocused(getInitialFocusState());

    const onFocus = () => setIsWindowFocused(true);
    const onBlur = () => setIsWindowFocused(false);

    const handleVisibilityChange = () => {
      setIsWindowFocused(document.visibilityState === 'visible');
    };

    // this tracks window focus
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);

    // this tracks tab changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { isWindowFocused };
}

function getInitialFocusState() {
  return (
    typeof window !== 'undefined' &&
    document.visibilityState === 'visible' &&
    hasFocus()
  );
}

function hasFocus() {
  return typeof window !== 'undefined' && document.hasFocus();
}
