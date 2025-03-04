import {
  ArrowCircleDown2,
  ArrowRotateRight,
  Copy,
  Dislike,
  Like1,
  TickSquare,
} from "iconsax-react";
import {
  Message,
  TextContentBlock,
} from "openai/resources/beta/threads/messages";
import { FileObject } from "openai/resources/files";
import { useEffect, useState } from "react";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import { cn } from "~/lib/utils";
import { imageExtensions } from "~/services/assistantsService";
import {
  HandleSend,
  observeImageResizeClassname,
} from "../../AssistantsChatPage";
// import { SuperPowerPromptPrefix } from "../InputForm/InputForm";
import { MemoizedMarkdownRenderer } from "~/components/ChatPage/Children/MarkdownRenderer";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Skeleton } from "~/components/ui/skeleton";
import { questionsCode } from "~/lib/prompts";
import assistantsService from "~/services/assistantsService";
import { FilePreview } from "../FileUploadedPreview/FileUploadedPreview";
import MessageActions, {
  ActionButton,
} from "./Children/MessageActions/MessageActions";

const getFilenameFromAnnotationText = (
  annotationText: string,
  type?: "image_file" | "other"
) => {
  const name = annotationText.split("/").pop();
  if (name) {
    if (name.indexOf(".") === -1) {
      if (type === "image_file") {
        return name + ".png";
      } else {
        return name + ".txt";
      }
    }
  }
  return name;
};
function extractTagContent(inputString: string, tagName: string) {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`);
  const match = inputString.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

interface RenderMessagesProps {
  messages?: Message[];
  handleSend: HandleSend;
  assistantMessageLoading: boolean;
  scrollToBottom: () => void;
}
const RenderMessages: React.FC<RenderMessagesProps> = ({
  messages,
  handleSend,
  assistantMessageLoading,
  scrollToBottom,
}) => {
  const { copy, copied, copiedText } = useCopyToClipboard();

  // const { userData } = useUserData();
  // const userId = userData?.id.toString();

  return (
    <div className="space-y-[30px]">
      {messages?.map((message, i) => {
        const textContent = message.content.find((v) => v.type === "text") as
          | TextContentBlock
          | undefined;
        let text = textContent?.text?.value ?? "";
        let title = null;
        if (message.role === "user") {
          title = extractTagContent(text, "title");
          // replace everything inside <hidden></hidden> tag with empty string
          text = text.replace(/<hidden>[\s\S]*?<\/hidden>/, "");
        }
        let questionSuggestions: string[] = [];
        let questionSuggestionsLoading = false;
        if (message.role === "assistant") {
          const questionsCodeStartIndex = text.indexOf(questionsCode.start);
          const questionsCodeEndIndex = text.indexOf(questionsCode.end);
          if (questionsCodeStartIndex != -1) {
            questionSuggestionsLoading = true;
          }
          if (questionsCodeEndIndex !== -1) {
            questionSuggestionsLoading = false;

            questionSuggestions = text
              .slice(
                questionsCodeStartIndex + questionsCode.start.length,
                questionsCodeEndIndex
              )
              .split(",");
          }
        }

        return (
          <div key={i}>
            {message.role === "user" && (
              <div className="flex flex-col items-end">
                {message.content.map((content, i) => {
                  if (content.type === "image_url") {
                    return (
                      <div
                        key={`${content.image_url.url}-${i}`}
                        className="w-full md:w-[50%] mb-[16px] flex justify-end"
                      >
                        <img
                          src={content.image_url.url}
                          alt={content.image_url.url}
                          className={cn(
                            "rounded-[8px]",
                            observeImageResizeClassname
                          )}
                        />
                      </div>
                    );
                  }
                })}
              </div>
            )}
            <div>
              {message.content.map((content, i) => {
                if (content.type === "image_file") {
                  return (
                    <div
                      className="mb-[16px]"
                      key={`${content.image_file.file_id}-${i}`}
                    >
                      <RenderAttachment
                        fileId={content.image_file.file_id}
                        role={message.role}
                        type={content.type}
                        scrollToBottom={scrollToBottom}
                      />
                    </div>
                  );
                }
              })}
            </div>
            <div
              className={cn(
                "flex flex-col",
                message.role === "assistant" ? "items-start" : "items-end"
              )}
            >
              {message.attachments?.map((attachment, i) => {
                if (!attachment.file_id) return null;
                return (
                  <div key={`${attachment.file_id}-${i}`} className="mb-[16px]">
                    <RenderAttachment
                      fileId={attachment.file_id}
                      key={attachment.file_id}
                      role={message.role}
                      type="other"
                      scrollToBottom={scrollToBottom}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex">
              {message.role === "assistant" ? (
                <>
                  <div className="w-full">
                    <div className="relative w-full">
                      <MessageContainer role="assistant">
                        <MemoizedMarkdownRenderer
                          loading={message.status === "in_progress"}
                        >
                          {text}
                        </MemoizedMarkdownRenderer>
                      </MessageContainer>
                      {message.status !== "in_progress" && (
                        <div>
                          <MessageActions>
                            <>
                              <ActionButton
                                icon={<ArrowRotateRight size={18} />}
                                onClick={() => {
                                  // rerun the last user message
                                  const lastUserMessage = [
                                    ...messages.slice(0, i),
                                  ]
                                    .reverse()
                                    ?.find((m) => m.role === "user");
                                  if (lastUserMessage) {
                                    const textContent =
                                      lastUserMessage.content.find(
                                        (v) => v.type === "text"
                                      ) as TextContentBlock | undefined;
                                    handleSend({
                                      text: textContent?.text?.value ?? "",
                                    });
                                  }
                                }}
                              ></ActionButton>
                              <ActionButton
                                icon={
                                  copiedText === text && copied ? (
                                    <TickSquare size={18} />
                                  ) : (
                                    <Copy size={18} />
                                  )
                                }
                                onClick={() => {
                                  copy(text);
                                }}
                              ></ActionButton>
                              <ActionButton
                                icon={<Like1 size={18} />}
                                onClick={() => {}}
                              ></ActionButton>
                              <ActionButton
                                icon={<Dislike size={18} />}
                                onClick={() => {}}
                              ></ActionButton>
                            </>
                          </MessageActions>
                        </div>
                      )}
                    </div>
                    <div className="h-[12px]"></div>

                    <RenderQuestionSuggestions
                      questionSuggestionsLoading={questionSuggestionsLoading}
                      questionSuggestions={questionSuggestions}
                      handleSend={handleSend}
                    />
                  </div>
                </>
              ) : (
                <>
                  <MessageContainer role="user">
                    <div className="messageContent">{title ?? text}</div>
                  </MessageContainer>
                </>
              )}
            </div>
          </div>
        );
      })}

      {assistantMessageLoading && (
        <div>
          <MessageContainer role="assistant">
            <SkeletonLoaders />
          </MessageContainer>
        </div>
      )}
    </div>
  );
};
export default RenderMessages;

interface RenderAttachmentProps {
  fileId: string;
  role: "user" | "assistant";
  type: "image_file" | "other";
  scrollToBottom: () => void;
}
const RenderAttachment: React.FC<RenderAttachmentProps> = ({
  fileId,
  role,
  type,
  scrollToBottom,
}) => {
  const [fileUrl, setFileUrl] = useState<string>();
  const [fileObject, setFileObject] = useState<FileObject>();
  useEffect(() => {
    if (!fileObject) {
      (async () => {
        const result = await assistantsService.retrieveFile(fileId);
        setFileObject(result);
      })();
    }
  }, [fileId, fileObject]);
  useEffect(() => {
    if (!fileUrl && fileObject && fileObject.purpose !== "assistants") {
      (async () => {
        const result = await assistantsService.retrieveFileContent(
          fileId,
          fileObject
        );
        setFileUrl(result.url);
      })();
    }
  }, [fileId, fileObject, fileUrl]);

  useEffect(() => {
    scrollToBottom();
  }, [fileObject, scrollToBottom]);
  if (!fileObject) return null;

  const filename =
    role === "assistant"
      ? getFilenameFromAnnotationText(fileObject.filename, type)
      : fileObject.filename.slice(38);
  if (!filename) return null;
  const isImage = imageExtensions.some((ext) =>
    filename.toLowerCase().endsWith(ext)
  );
  if (isImage) {
    return (
      <div
        className={cn(
          "relative w-full md:w-[50%] min-h-[100px] min-w-[100px]",
          role === "user" && "ml-auto"
        )}
      >
        {!fileUrl ? (
          <div className="absolute top-0 left-0 w-full h-full rounded-[8px] bg-black bg-opacity-5 flex justify-center items-center">
            <div>
              <LoadingSpinner />
            </div>
          </div>
        ) : (
          <img
            src={fileUrl}
            alt={filename}
            className={cn("rounded-[8px]", observeImageResizeClassname)}
          />
        )}
      </div>
    );
  }
  return (
    <FilePreview fileName={filename} loading={role === "assistant" && !fileUrl}>
      {role === "assistant" && fileUrl && (
        <a href={fileUrl} download={filename}>
          <ArrowCircleDown2 size={20} className="stroke-foreground" />
        </a>
      )}
    </FilePreview>
  );
};

interface MessageContainerProps {
  role: "user" | "assistant";
  children: any;
}
const MessageContainer: React.FC<MessageContainerProps> = ({
  role,
  children,
}) => {
  return (
    <div
      className={cn(
        "rounded-lg",
        role === "assistant"
          ? "bg-transparent"
          : "bg-gray-100 dark:bg-gray-800",
        role === "user" ? "ml-auto text-right max-w-[80%]" : ""
      )}
    >
      {children}
    </div>
  );
};

const SkeletonLoaders = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="rounded-full h-[20px] w-1/2" />
      <Skeleton className="rounded-full h-[20px]" />
      <Skeleton className="rounded-full h-[20px]" />
    </div>
  );
};

interface RenderQuestionSuggestionsProps {
  questionSuggestionsLoading: boolean;
  questionSuggestions: string[];
  handleSend: HandleSend;
}
const RenderQuestionSuggestions: React.FC<RenderQuestionSuggestionsProps> = ({
  questionSuggestionsLoading,
  questionSuggestions,
  handleSend,
}) => {
  if (questionSuggestionsLoading) {
    return (
      <MessageContainer role="assistant">
        <SkeletonLoaders />
      </MessageContainer>
    );
  }
  if (questionSuggestions.length > 0) {
    return (
      <div>
        <div className="h-[16px]"></div>
        <div className="flex flex-col gap-[8px] items-start">
          {questionSuggestions.map((question, i) => {
            return (
              <button
                key={question + i}
                className="text-[14px] p-[12px] border border-gs-light-mode-grey-3 rounded-[6px] text-left"
                onClick={() => {
                  handleSend({ text: question });
                }}
              >
                {question}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};
