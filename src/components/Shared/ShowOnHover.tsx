import { useRef } from "react";
import useHover from "~/hooks/useHover";

interface ShowOnHoverProps {
  getMainElement: (hovered: boolean) => any;
  hiddenElement: any;
}
const ShowOnHover: React.FC<ShowOnHoverProps> = ({
  getMainElement,
  hiddenElement,
}) => {
  const mainElementRef = useRef<any>(null);
  const mainElementHovered = useHover(mainElementRef);
  return (
    <div className="relative" ref={mainElementRef}>
      {mainElementHovered && (
        <div className="absolute top-0 left-0 z-50 translate-y-10">
          {hiddenElement}
        </div>
      )}
      <div>{getMainElement(mainElementHovered)}</div>
    </div>
  );
};
export default ShowOnHover;
