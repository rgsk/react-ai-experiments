import { ChevronDown, ChevronUp } from "lucide-react";
import { useRef, useState } from "react";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Button } from "~/components/ui/button";
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { cn } from "~/lib/utils";
import { Collapsible } from "../ui/collapsible";
import MaintiainOriginalWidth from "./MaintiainOriginalWidth";
interface CollapsibleWrapperProps {
  heading: string;
  children: any;
  level?: number;
  loading?: boolean;
  type?: "left" | "right";
  scrollContainerRef?: React.MutableRefObject<HTMLDivElement | null>;
  triggerClassName?: string;
  openByDefault?: boolean;
}
const CollapsibleWrapper: React.FC<CollapsibleWrapperProps> = ({
  heading,
  children,
  loading,
  level = 1,
  type = "left",
  scrollContainerRef,
  triggerClassName,
  openByDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(openByDefault);
  const collapsibleRef = useRef<any>(null);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} ref={collapsibleRef}>
      <div className={cn("flex flex-col", type === "right" && "items-end")}>
        <CollapsibleTrigger
          asChild
          className={cn(
            "sticky bg-background",
            level === 1 ? "top-[-32px] z-30" : "top-[0px] z-20",
            triggerClassName
          )}
          onClick={() => {
            if (isOpen) {
              const collapsible = collapsibleRef.current as HTMLDivElement;
              if (collapsible) {
                const top = collapsible.getBoundingClientRect().top;
                if (top < 32) {
                  collapsible.scrollIntoView();
                  const scrollContainer = scrollContainerRef?.current;
                  if (scrollContainer) {
                    if (level === 1) {
                      scrollContainer.scrollBy(0, 16);
                    } else if (level === 2) {
                      scrollContainer.scrollBy(0, -32);
                    }
                  }
                }
              }
            }
          }}
        >
          <div
            className={cn(
              "flex items-center gap-4",
              type === "right" && "flex-row-reverse"
            )}
          >
            <Button variant="secondary" size="sm">
              <span className="text-sm">{heading}</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {loading && <LoadingSpinner size={18} />}
          </div>
        </CollapsibleTrigger>
        {isOpen && <div className="h-4"></div>}
        <CollapsibleContent>
          <MaintiainOriginalWidth>
            <div className={cn(type === "left" ? "border-l-2" : "border-r-2")}>
              {children}
            </div>
          </MaintiainOriginalWidth>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default CollapsibleWrapper;
