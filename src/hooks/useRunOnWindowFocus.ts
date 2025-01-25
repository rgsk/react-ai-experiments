import { useEffect, useRef } from "react";
import { useWindowFocus } from "./useWindowFocus";

const useRunOnWindowFocus = (cb: () => void) => {
  const { isWindowFocused } = useWindowFocus();
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    if (isWindowFocused) {
      cbRef.current();
    }
  }, [isWindowFocused]);
};
export default useRunOnWindowFocus;
