import { Copy } from "iconsax-react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Separator } from "~/components/ui/separator";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import { Message } from "~/lib/typesJsonData";
import { cn } from "~/lib/utils";
import { HandleSend } from "../../ChatPage";
import { MemoizedMarkdownRenderer } from "../MarkdownRenderer";
import MessageActions, { ActionButton } from "../MessageActions/MessageActions";
interface RenderMessagesProps {
  messages: Message[];
  handleSend: HandleSend;
}
const RenderMessages: React.FC<RenderMessagesProps> = ({
  messages,
  handleSend,
}) => {
  const { copy, copied, copiedText } = useCopyToClipboard();

  const loading =
    messages.length > 0 &&
    !(messages[messages.length - 1].role === "assistant") &&
    messages.every((m) => m.status === "completed");
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
                  loading={message.status === "in_progress"}
                >
                  <p className="whitespace-pre-wrap">
                    {JSON.stringify(toolCall, null, 4)}
                  </p>
                  <Separator className="my-4 h-[2px]" />
                  <div className="my-4">
                    <p>Output:</p>
                  </div>
                  {message.status === "in_progress" ? (
                    <LoadingSpinner size={20} />
                  ) : (
                    <p className="whitespace-pre-wrap">
                      {message.content as string}
                    </p>
                  )}
                </CollapsibleWrapper>
              </div>
            </div>
          );
        } else if (message.role === "assistant") {
          return (
            <div key={key} className={cn("w-full break-words relative")}>
              <AIAvatar />
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
            <div key={key} className="w-full flex group">
              <div
                className={cn(
                  "rounded-lg bg-gray-100 dark:bg-gray-800 mx-4 break-words ml-auto max-w-[640px] relative"
                )}
              >
                <div className="absolute top-0 left-0 -translate-x-full group-hover:opacity-100 opacity-0 transition-all">
                  <div className="p-4">
                    <ActionButton
                      icon={
                        copiedText === message.content && copied ? (
                          <Check size={18} />
                        ) : (
                          <Copy size={18} />
                        )
                      }
                      onClick={() => {
                        copy(message.content as string);
                      }}
                    ></ActionButton>
                  </div>
                </div>
                <MemoizedMarkdownRenderer
                  loading={message.status === "in_progress"}
                >
                  {(message.content ?? "") as string}
                </MemoizedMarkdownRenderer>
              </div>
            </div>
          );
        } else {
          return null;
        }
      })}
      {loading && (
        <div className="relative w-full p-4">
          <AIAvatar />
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};
export default RenderMessages;

interface AIAvatarProps {}
const AIAvatar: React.FC<AIAvatarProps> = ({}) => {
  return (
    <div className="absolute top-0 left-0 -translate-x-full translate-y-1/2">
      <img src="/ai-avatar.svg" className="w-[24px]" />
    </div>
  );
};

interface CollapsibleWrapperProps {
  heading: string;
  children: any;
  loading?: boolean;
}
const CollapsibleWrapper: React.FC<CollapsibleWrapperProps> = ({
  heading,
  children,
  loading,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-4">
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
      <div className="h-4"></div>
      <CollapsibleContent>
        <div className="border-l-2 pl-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};
