import { RefObject } from "react";
import { cn } from "~/lib/utils";

interface ContainerProps {
  children: any;
  divRef?: RefObject<HTMLDivElement | null>;
  applyChatWidthLimit?: boolean;
}
const Container: React.FC<ContainerProps> = ({
  divRef,
  children,
  applyChatWidthLimit,
}) => {
  return (
    <div
      ref={divRef as any}
      className={cn("w-full h-full flex-1 overflow-auto", "py-4 px-4")}
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
