import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Separator } from "~/components/ui/separator";
import { Message } from "~/lib/typesJsonData";
import { cn } from "~/lib/utils";
import { HandleSend } from "../../ChatPage";
import { MemoizedMarkdownRenderer } from "../MarkdownRenderer";
import MessageActions from "../MessageActions/MessageActions";
interface RenderMessagesProps {
  messages: Message[];
  handleSend: HandleSend;
}
const RenderMessages: React.FC<RenderMessagesProps> = ({
  messages,
  handleSend,
}) => {
  return (
    <div className="flex flex-col gap-4 items-end">
      {messages.map((message, i) => {
        const key = `id: ${message.id}, index - ${i}`;
        if (message.role === "tool") {
          const toolCall = messages
            .slice(0, i)
            .reverse()
            .find((m) => m.role === "assistant")
            ?.tool_calls?.find((tc) => tc.id === message.tool_call_id);
          if (!toolCall) return null;
          return (
            <div key={key} className="px-4 w-full">
              <div>
                <CollapsibleWrapper
                  heading={`Tool Call - ${toolCall.function.name}`}
                >
                  <p className="whitespace-pre-wrap">
                    {JSON.stringify(toolCall, null, 4)}
                  </p>
                  <Separator className="my-4 h-[2px]" />
                  <div className="my-4">
                    <p>Output:</p>
                  </div>
                  <p className="whitespace-pre-wrap">
                    {message.content as string}
                  </p>
                </CollapsibleWrapper>
              </div>
            </div>
          );
        } else if (message.role === "assistant") {
          return (
            <div key={key} className={cn("w-full break-words relative")}>
              <div className="absolute top-0 left-0 -translate-x-full translate-y-1/2">
                <img src="/ai-avatar.svg" className="w-[24px]" />
              </div>
              <MemoizedMarkdownRenderer
                loading={message.status === "in_progress"}
              >
                {(message.content ?? "") as string}
              </MemoizedMarkdownRenderer>
              {message.status !== "in_progress" && (
                <div className="m-4">
                  <MessageActions
                    handleSend={handleSend}
                    messages={messages}
                    index={i}
                  />
                </div>
              )}
              {message.tool_calls && (
                <div className="px-4">
                  <CollapsibleWrapper heading="Tool Calls">
                    <p className="whitespace-pre-wrap">
                      {JSON.stringify(message.tool_calls, null, 4)}
                    </p>
                  </CollapsibleWrapper>
                </div>
              )}
            </div>
          );
        } else if (message.role === "user") {
          return (
            <div
              key={key}
              className={cn(
                "rounded-lg bg-gray-100 dark:bg-gray-800 mx-4 break-words ml-auto max-w-[80%]"
              )}
            >
              <MemoizedMarkdownRenderer
                loading={message.status === "in_progress"}
              >
                {(message.content ?? "") as string}
              </MemoizedMarkdownRenderer>
            </div>
          );
        } else {
          return null;
        }
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
      <CollapsibleContent>
        <div className="border-l-2 pl-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};
