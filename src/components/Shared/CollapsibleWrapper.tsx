import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Button } from "~/components/ui/button";
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { cn } from "~/lib/utils";
import { Collapsible } from "../ui/collapsible";
interface CollapsibleWrapperProps {
  heading: string;
  children: any;
  loading?: boolean;
  type?: "left" | "right";
}
const CollapsibleWrapper: React.FC<CollapsibleWrapperProps> = ({
  heading,
  children,
  loading,
  type = "left",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("flex flex-col", type === "right" && "items-end")}>
        <CollapsibleTrigger asChild>
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
          <div className={cn(type === "left" ? "border-l-2" : "border-r-2")}>
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default CollapsibleWrapper;
