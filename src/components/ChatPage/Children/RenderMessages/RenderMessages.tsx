import { Copy } from "iconsax-react";
import { ArrowRight, Check } from "lucide-react";
import ActionButton from "~/components/Shared/ActionButton";
import CollapsibleWrapper from "~/components/Shared/CollapsibleWrapper";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Separator } from "~/components/ui/separator";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import { separator } from "~/lib/specialMessageParser";
import { Message } from "~/lib/typesJsonData";
import { cn } from "~/lib/utils";
import { FileEntry, HandleSend } from "../../ChatPage";
import FileUploadedPreview from "../FileUploadedPreview/FileUploadedPreview";
import { MemoizedMarkdownRenderer } from "../MarkdownRenderer";
import MessageActions from "../MessageActions/MessageActions";
import RenderToolCall from "./RenderToolCall";
interface RenderMessagesProps {
  messages: Message[];
  handleSend: HandleSend;
  scrollToBottom: () => void;
  hadPendingToolCalls: boolean;
  scrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}
const RenderMessages: React.FC<RenderMessagesProps> = ({
  messages,
  handleSend,
  scrollToBottom,
  hadPendingToolCalls,
  scrollContainerRef,
}) => {
  const { copy, copied, copiedText } = useCopyToClipboard();

  const loading =
    (messages.length > 0 &&
      messages[messages.length - 1].role !== "assistant" &&
      messages.every((m) => m.status === "completed")) ||
    hadPendingToolCalls;
  return (
    <div className="flex flex-col gap-4 items-end">
      {messages.map((message, i) => {
        const key = `id: ${message.id}, index - ${i}`;
        if (!message.content) {
          return null;
        } else if (message.type === "file") {
          const { fileEntry, content } = JSON.parse(
            message.content as string
          ) as {
            fileEntry: FileEntry;
            content: string;
            instruction: string;
          };
          return (
            <div key={key} className="w-full">
              <div className="flex justify-end">
                <FileUploadedPreview fileEntry={fileEntry} />
              </div>
              <div className="h-4"></div>
              <div className="flex justify-end">
                <div className="max-w-[640px]">
                  <CollapsibleWrapper
                    scrollContainerRef={scrollContainerRef}
                    heading={`File Parsing Result - ${
                      fileEntry.fileMetadata!.name
                    }`}
                    type="right"
                    loading={message.status === "in_progress"}
                  >
                    <div className="pr-4">
                      <p>{content}</p>
                    </div>
                  </CollapsibleWrapper>
                </div>
              </div>
            </div>
          );
        } else if (message.type === "image_url") {
          const fileName = (message as any).content[0].text;
          const url = (message as any).content[1].image_url.url;
          return (
            <div key={key} className="w-full">
              <div className="flex justify-end">
                <img
                  src={url}
                  alt={url}
                  className="w-[50%]"
                  onLoad={scrollToBottom}
                />
              </div>
            </div>
          );
        } else if (message.type === "image_ocr") {
          const { fileName, url, content } = JSON.parse(
            message.content as string
          ) as {
            fileName: string;
            url: string;
            content: string;
          };
          const { imageModelOutput, imageOCROutput } = content as any;
          return (
            <div key={key} className="w-full">
              <div className="flex justify-end">
                <img
                  src={url}
                  alt={url}
                  className="w-[50%]"
                  onLoad={scrollToBottom}
                />
              </div>
              <div className="h-4"></div>
              <div className="flex justify-end">
                <div className="max-w-[640px]">
                  <CollapsibleWrapper
                    scrollContainerRef={scrollContainerRef}
                    heading={`Image Parsing Result - ${fileName}`}
                    type="right"
                    loading={message.status === "in_progress"}
                  >
                    <div className="pr-4">
                      <p>Image Model Output:</p>
                      <p>{imageModelOutput}</p>
                    </div>
                    <Separator className="my-4 h-[2px]" />
                    <div className="pr-4">
                      <p>Image OCR Output:</p>
                      <p>{imageOCROutput}</p>
                    </div>
                  </CollapsibleWrapper>
                </div>
              </div>
            </div>
          );
        } else if (message.role === "tool") {
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
                  scrollContainerRef={scrollContainerRef}
                  heading={`Tool Call - ${toolCall.function.name}`}
                  loading={message.status === "in_progress"}
                >
                  <RenderToolCall
                    toolCall={toolCall}
                    message={message}
                    scrollContainerRef={scrollContainerRef}
                  />
                </CollapsibleWrapper>
              </div>
            </div>
          );
        } else if (message.role === "assistant") {
          let questionSuggestions: string[] = [];
          let questionSuggestionsLoading = false;
          const text = message.content as string;
          if (message.role === "assistant") {
            const questionsCodeStartIndex = text.indexOf(`<questions>`);
            const questionsCodeEndIndex = text.indexOf(`</questions>`);
            if (questionsCodeStartIndex != -1) {
              questionSuggestionsLoading = true;
            }
            if (questionsCodeEndIndex !== -1) {
              questionSuggestionsLoading = false;

              questionSuggestions = text
                .slice(
                  questionsCodeStartIndex + `<questions>`.length,
                  questionsCodeEndIndex
                )
                .split(separator);
            }
          }
          console.log({ questionSuggestions, questionSuggestionsLoading });
          return (
            <div key={key} className="w-full relative">
              <div className={cn("w-full break-words")}>
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
                    <CollapsibleWrapper
                      scrollContainerRef={scrollContainerRef}
                      heading="Tool Calls"
                    >
                      <p className="whitespace-pre-wrap pl-4">
                        {JSON.stringify(message.tool_calls, null, 4)}
                      </p>
                    </CollapsibleWrapper>
                  </div>
                )}
              </div>
              <div className="p-4">
                {questionSuggestionsLoading && <LoadingSpinner size={20} />}
                {questionSuggestions.length > 0 && (
                  <>
                    <div>
                      <p>Related Questions:</p>
                    </div>
                    <div className="h-2"></div>
                    <div className="flex flex-col">
                      {questionSuggestions.map((qs, i) => (
                        <button
                          key={qs + i}
                          onClick={() => {
                            handleSend({ text: qs });
                          }}
                        >
                          {i === 0 && <Separator />}
                          <div className="py-2 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <span>{qs}</span>
                            <ArrowRight className="h-5 w-5" />
                          </div>
                          <Separator />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
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
                      onClick={() => {
                        copy(message.content as string);
                      }}
                    >
                      {copiedText === message.content && copied ? (
                        <Check size={18} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </ActionButton>
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
