import { Copy } from "iconsax-react";
import { ArrowRight, Check, Download } from "lucide-react";
import { useEffect, useState } from "react";
import ActionButton from "~/components/Shared/ActionButton";
import CollapsibleWrapper from "~/components/Shared/CollapsibleWrapper";
import CsvRenderer from "~/components/Shared/CsvRenderer";
import ImagePreview from "~/components/Shared/ImagePreview";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import PDFReader from "~/components/Shared/PDFReader/PDFReader";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import useGlobalContext, { LogLevel } from "~/hooks/useGlobalContext";
import { messageContentParsers } from "~/lib/messageContentParsers";
import { Message } from "~/lib/typesJsonData";
import { cn } from "~/lib/utils";
import { HandleSend } from "../../ChatPage";
import { FilePreview } from "../FileUploadedPreview/FileUploadedPreview";
import { MemoizedMarkdownRenderer } from "../MarkdownRenderer";
import MessageActions from "../MessageActions/MessageActions";
import RenderToolCall from "./RenderToolCall";
export type DisplayMessagesType = "chat" | "shared-chat";
interface RenderMessagesProps {
  messages: Message[];
  handleSend?: HandleSend;
  scrollToBottom?: () => void;
  loading?: boolean;
  scrollContainerRef?: React.MutableRefObject<HTMLDivElement | null>;
  type: DisplayMessagesType;
}
const RenderMessages: React.FC<RenderMessagesProps> = ({
  messages,
  handleSend,
  scrollToBottom,
  loading,
  scrollContainerRef,
  type,
}) => {
  const { copy, copied, copiedText } = useCopyToClipboard();
  const [previewedImageUrl, setPreviewedImageUrl] = useState<string>();
  const { logLevel } = useGlobalContext();

  useEffect(() => {
    if (messages.length > 0) {
      const hashValue = window.location.hash;
      if (hashValue) {
        const id = hashValue.substring(1);
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView();
          scrollContainerRef?.current?.scrollBy({ top: -16 });
        }, 100);
      }
    }
  }, [messages.length, scrollContainerRef]);

  return (
    <div>
      {previewedImageUrl && (
        <ImagePreview
          onClose={() => {
            setPreviewedImageUrl(undefined);
          }}
          url={previewedImageUrl}
        />
      )}

      <div className="flex flex-col gap-4 items-end">
        {messages.map((message, i) => {
          const key = `id: ${message.id}, index - ${i}`;
          if (!message.content) {
            return null;
          } else if (message.type === "file") {
            const { fileEntry, parsedContent } = messageContentParsers.file(
              message.content
            );
            return (
              <div key={key} id={`message-${message.id}`} className="w-full">
                <div className="flex justify-end">
                  <FilePreview
                    fileName={fileEntry.fileMetadata!.name}
                    loading={false}
                  >
                    <a
                      href={fileEntry.s3Url}
                      download={fileEntry.fileMetadata!.name}
                    >
                      <Button size="icon" variant="outline">
                        <Download size={30} />
                      </Button>
                    </a>
                  </FilePreview>
                </div>
                {logLevel === LogLevel.DEBUG && (
                  <>
                    <div className="h-4"></div>
                    <div>
                      <CollapsibleWrapper
                        scrollContainerRef={scrollContainerRef}
                        heading={`View - ${fileEntry.fileMetadata!.name}`}
                        type="right"
                        loading={false}
                      >
                        <div className="pr-4 w-[784px]">
                          {fileEntry.s3Url!.endsWith(".pdf") ? (
                            <PDFReader
                              pdfUrl={fileEntry.s3Url!}
                              fileName={fileEntry.fileMetadata!.name}
                            />
                          ) : fileEntry.s3Url!.endsWith(".csv") ? (
                            <CsvRenderer
                              url={fileEntry.s3Url!}
                              fileName={fileEntry.fileMetadata!.name}
                            />
                          ) : (
                            <p>
                              Rendering the file {fileEntry.fileMetadata!.name}{" "}
                              is not supported.
                            </p>
                          )}
                        </div>
                      </CollapsibleWrapper>
                    </div>
                    <div className="h-4"></div>
                    <div className="flex justify-end">
                      <div className="w-[640px]">
                        <CollapsibleWrapper
                          scrollContainerRef={scrollContainerRef}
                          heading={`File Parsing Result - ${
                            fileEntry.fileMetadata!.name
                          }`}
                          type="right"
                          loading={message.status === "in_progress"}
                        >
                          <div className="pr-4">
                            <p className="whitespace-pre-wrap break-words w-[640px]">
                              {JSON.stringify(parsedContent, null, 4)}
                            </p>
                          </div>
                        </CollapsibleWrapper>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          } else if (message.type === "image_url") {
            const { url } = messageContentParsers.image_url(message.content);
            return (
              <div key={key} id={`message-${message.id}`} className="w-full">
                <div className="flex justify-end">
                  <img
                    onClick={() => {
                      setPreviewedImageUrl(url);
                    }}
                    src={url}
                    alt={url}
                    className="w-[50%]"
                    onLoad={scrollToBottom}
                  />
                </div>
              </div>
            );
          } else if (message.type === "image_ocr") {
            const { fileName, imageModelOutput, imageOCROutput, url } =
              messageContentParsers.image_ocr(message.content);
            return (
              <div key={key} id={`message-${message.id}`} className="w-full">
                <div className="flex justify-end">
                  <img
                    onClick={() => {
                      setPreviewedImageUrl(url);
                    }}
                    src={url}
                    alt={url}
                    className="w-[50%]"
                    onLoad={scrollToBottom}
                  />
                </div>
                {logLevel === LogLevel.DEBUG && (
                  <>
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
                  </>
                )}
              </div>
            );
          } else if (message.role === "tool") {
            if (logLevel !== LogLevel.DEBUG) return null;
            const toolCall = messages
              .slice(0, i)
              .reverse()
              .find((m) => m.role === "assistant")
              ?.tool_calls?.find((tc) => tc.id === message.tool_call_id);
            if (!toolCall) return null;

            return (
              <div
                key={key}
                id={`message-${message.id}`}
                className="px-4 w-full"
              >
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
            if (typeof message.content !== "string") return null;
            if (logLevel !== LogLevel.DEBUG) {
              if (message.content.startsWith("calling tools - ")) return null;
            }
            const {
              reasoningContent,
              text,
              hasQuestionSuggestions,
              questionSuggestions,
              questionSuggestionsLoading,
            } = messageContentParsers.assistant(message.content);
            return (
              <div
                key={key}
                id={`message-${message.id}`}
                className="w-full relative px-4"
              >
                <div className={cn("w-full break-words")}>
                  <AIAvatar />
                  {reasoningContent && (
                    <CollapsibleWrapper
                      heading="Reasoning"
                      openByDefault={true}
                    >
                      <p className="pl-4 text-sm text-muted-foreground">
                        {reasoningContent}
                      </p>
                    </CollapsibleWrapper>
                  )}

                  <MemoizedMarkdownRenderer
                    loading={message.status === "in_progress"}
                  >
                    {text}
                  </MemoizedMarkdownRenderer>
                  {message.status !== "in_progress" && (
                    <div>
                      <MessageActions
                        handleSend={handleSend}
                        messages={messages}
                        index={i}
                        type={type}
                      />
                    </div>
                  )}
                  <div className="h-4"></div>
                  {message.tool_calls && logLevel === LogLevel.DEBUG && (
                    <div>
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
                {hasQuestionSuggestions && (
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
                                handleSend?.({ text: qs });
                              }}
                            >
                              {i === 0 && <Separator />}
                              <div className="py-2 text-left flex gap-2 items-center justify-between hover:bg-muted/50 transition-colors">
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
                )}
              </div>
            );
          } else if (message.role === "user") {
            return (
              <div
                key={key}
                id={`message-${message.id}`}
                className="w-full flex group whitespace-pre-wrap"
              >
                <div
                  className={cn(
                    "rounded-lg bg-gray-100 dark:bg-gray-800 px-4 break-words ml-auto max-w-[640px] relative"
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
                    collapsibleWrapperTriggerClassname={
                      "bg-gray-100 dark:bg-gray-800"
                    }
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
