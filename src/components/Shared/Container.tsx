import { MutableRefObject } from "react";
import { cn } from "~/lib/utils";

interface ContainerProps {
  children: any;
  divRef?: MutableRefObject<HTMLDivElement | null>;
  centerContent?: boolean;
}
const Container: React.FC<ContainerProps> = ({
  divRef,
  children,
  centerContent,
}) => {
  return (
    <div
      ref={divRef}
      className={cn(
        "w-full max-w-[800px] m-auto flex-1 overflow-auto",
        centerContent ? "py-[32px]" : "py-[32px] px-[32px]"
      )}
    >
      {centerContent ? (
        <div className="h-full overflow-auto px-[32px] grid place-items-center">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};
export default Container;
