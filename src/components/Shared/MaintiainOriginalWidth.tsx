import useMeasure from "react-use-measure";
import { cn } from "~/lib/utils";

interface MaintiainOriginalWidthProps {
  children: any;
  className?: string;
  hideScrollbar?: boolean;
}
const MaintiainOriginalWidth: React.FC<MaintiainOriginalWidthProps> = ({
  children,
  className,
  hideScrollbar,
}) => {
  const [divRef, divBounds] = useMeasure();

  return (
    <div>
      <div ref={divRef}></div>
      <div
        className={cn(
          "overflow-auto",
          hideScrollbar && "hideScrollbar",
          className
        )}
        style={{
          maxWidth: divBounds.width,
        }}
      >
        {children}
      </div>
    </div>
  );
};
export default MaintiainOriginalWidth;
