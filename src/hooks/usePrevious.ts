import { useEffect, useRef } from "react";

function usePrevious<T>(value: T) {
  // Declare a ref to hold the previous value
  const ref = useRef<T>();

  // Store the current value in the ref after every render
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only update ref when the value changes

  // Return the previous value (before it was updated)
  return ref.current;
}

export default usePrevious;
