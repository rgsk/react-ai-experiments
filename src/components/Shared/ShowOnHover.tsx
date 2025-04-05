import { useEffect, useMemo, useState } from "react";
import { usePopper } from "react-popper";
import { v4 } from "uuid";
import useBreakpoints from "~/hooks/useBreakpoints";
import useEventListener from "~/hooks/useEventListener";
import { useWindowSize } from "~/hooks/useWindowSize";

interface ShowOnHoverProps {
  getMainElement: (hovered: boolean) => any;
  hiddenElement: any;
}

const ShowOnHover: React.FC<ShowOnHoverProps> = ({
  getMainElement,
  hiddenElement,
}) => {
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );
  const windowSize = useWindowSize();
  const { md } = useBreakpoints();
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const componentId = useMemo(() => v4(), []);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  const show = md ? hovered : tapped;
  useEventListener("click", () => {
    setTapped(false);
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, selfId } = event.data;
      if (type === "CLOSE_OTHERS_TAPPED" && componentId !== selfId) {
        setTapped(false);
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [componentId]);

  return (
    <div
      ref={setReferenceElement}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setTapped((prev) => !prev);
          window.postMessage(
            { type: "CLOSE_OTHERS_TAPPED", selfId: componentId },
            "*"
          );
        }}
      >
        {getMainElement(show)}
      </div>
      {show && (
        <div
          ref={setPopperElement}
          style={{
            ...styles.popper,
            zIndex: 1000,
            width: Math.min(windowSize.width - 64, 400),
          }}
          {...attributes.popper}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {hiddenElement}
        </div>
      )}
    </div>
  );
};

export default ShowOnHover;
