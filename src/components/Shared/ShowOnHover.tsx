import { useState } from "react";
import { usePopper } from "react-popper";

interface ShowOnHoverProps {
  getMainElement: (hovered: boolean) => any;
  hiddenElement: any;
}

const ShowOnHover: React.FC<ShowOnHoverProps> = ({
  getMainElement,
  hiddenElement,
}) => {
  const [hovered, setHovered] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

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

  return (
    <div
      ref={setReferenceElement}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>{getMainElement(hovered)}</div>
      {hovered && (
        <div
          ref={setPopperElement}
          style={{
            ...styles.popper,
            zIndex: 1000,
            width: 400,
          }}
          {...attributes.popper}
        >
          {hiddenElement}
        </div>
      )}
    </div>
  );
};

export default ShowOnHover;
