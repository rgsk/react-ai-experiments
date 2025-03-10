import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Message } from "~/lib/typesJsonData";
import { cn } from "~/lib/utils";
import { MemoizedMarkdownRenderer } from "../MarkdownRenderer";
interface RenderMessagesProps {
  messages: Message[];
}
const RenderMessages: React.FC<RenderMessagesProps> = ({ messages }) => {
  return (
    <div className="flex flex-col gap-4 items-end">
      {messages.map((message, i) => {
        return (
          <div
            key={`id: ${message.id}, index - ${i}`}
            className={cn(
              "rounded-lg break-words",
              message.role === "assistant"
                ? "bg-transparent w-full"
                : "bg-gray-100 dark:bg-gray-800 mx-4",
              message.role === "user" ? "ml-auto text-right max-w-[80%]" : ""
            )}
          >
            <MemoizedMarkdownRenderer
              loading={message.status === "in_progress"}
            >
              {(message.content ?? "") as string}
            </MemoizedMarkdownRenderer>

            {message.tool_calls && (
              <div className="p-4">
                <CollapsibleWrapper heading="Tool Calls">
                  <pre>{JSON.stringify(message.tool_calls, null, 2)}</pre>
                </CollapsibleWrapper>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default RenderMessages;

interface CollapsibleWrapperProps {
  heading: string;
  children: any;
}
const CollapsibleWrapper: React.FC<CollapsibleWrapperProps> = ({
  heading,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="secondary" size="sm">
          <span className="text-sm">{heading}</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <div className="h-4"></div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};
