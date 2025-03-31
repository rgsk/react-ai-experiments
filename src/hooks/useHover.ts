import { RefObject, useState } from "react";
import useEventListener from "./useEventListener";

function useHover<T extends HTMLElement | null = HTMLElement>(
  elementRef: RefObject<T>
): boolean {
  const [hovered, setHovered] = useState<boolean>(false);

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  useEventListener("mouseenter", handleMouseEnter, elementRef);
  useEventListener("mouseleave", handleMouseLeave, elementRef);

  return hovered;
}

export default useHover;
