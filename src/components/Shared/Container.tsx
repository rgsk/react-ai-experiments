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
        "w-full m-auto flex-1 overflow-auto",
        centerContent ? "py-[32px]" : "py-[32px] px-[32px]"
      )}
    >
      {centerContent ? (
        <div className="h-full overflow-auto px-[32px] grid place-items-center">
          <div className="max-w-[800px] mx-auto">{children}</div>
        </div>
      ) : (
        <div className="max-w-[800px] mx-auto">{children}</div>
      )}
    </div>
  );
};
export default Container;
