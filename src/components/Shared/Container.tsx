import { RefObject } from "react";
import { useWindowSize } from "~/hooks/useWindowSize";
import { cn } from "~/lib/utils";

interface ContainerProps {
  children: any;
  divRef?: RefObject<HTMLDivElement | null>;
  centerContent?: boolean;
  applyChatWidthLimit?: boolean;
  spanHeight?: boolean;
}
const Container: React.FC<ContainerProps> = ({
  divRef,
  children,
  centerContent,
  applyChatWidthLimit,
  spanHeight,
}) => {
  const windowSize = useWindowSize();
  return (
    <div
      ref={divRef as any}
      className={cn(
        "w-full h-full flex-1 overflow-auto",
        "py-4 px-4",
        centerContent && "flex justify-center items-center"
      )}
      style={{
        height: spanHeight ? windowSize?.height : undefined,
      }}
    >
      <div
        className={cn(
          "w-full max-w-[1264px] m-auto",
          applyChatWidthLimit && "max-w-[800px]",
          "h-full flex flex-col"
        )}
      >
        {children}
      </div>
    </div>
  );
};
export default Container;
