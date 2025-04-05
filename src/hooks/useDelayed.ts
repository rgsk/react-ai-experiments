import { useEffect, useRef, useState } from 'react';

const useDelayed = <T>(value: T, delay: number) => {
  const [copy, setCopy] = useState(value);
  const renderedRef = useRef(true);
  useEffect(() => {
    setTimeout(() => {
      if (renderedRef.current) setCopy(value);
    }, delay);
  }, [delay, value]);
  useEffect(() => {
    return () => {
      renderedRef.current = false;
    };
  }, []);
  return copy;
};
export default useDelayed;
