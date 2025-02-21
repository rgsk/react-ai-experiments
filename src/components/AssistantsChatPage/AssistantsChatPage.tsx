"use client";

import { AxiosError } from "axios";
import {
  Message,
  MessageCreateParams,
} from "openai/resources/beta/threads/messages";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 } from "uuid";
import useDropArea from "~/hooks/useDropArea";

import { encodeQueryParams, extractTagContent } from "~/lib/utils";

import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Container from "~/components/Shared/Container";
import useUserData from "~/hooks/auth/useUserData";
import { useAssistantsChatSocketListeners } from "~/hooks/useAssistantsChatSocketListeners";
import useEnsureScrolledToBottom from "~/hooks/useEnsureScrolledToBottom";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import { uuidPlaceholder } from "~/lib/constants";
import environmentVars from "~/lib/environmentVars";
import { generateQuestionPrompt } from "~/lib/prompts";
import { Conversation } from "~/lib/typesJsonData";
import assistantsService, {
  getToolForFile,
  supportedExtensions,
} from "~/services/assistantsService";
import experimentsService from "~/services/experimentsService";
import jsonDataService from "~/services/jsonDataService";
import NewChatIcon from "../Icons/NewChatIcon";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
import { ModeToggle } from "../Shared/ModeToggle";
import { Button } from "../ui/button";
import { getHistoryBlocks } from "./Children/History/HistoryBlock/getHistoryBlocks";
import HistoryBlock from "./Children/History/HistoryBlock/HistoryBlock";
import MessageInput, { FileEntry } from "./Children/MessageInput/MessageInput";
import RenderMessages from "./Children/RenderMessages/RenderMessages";

export const TemporaryUserMessageId = "temp-id";
export const observeImageResizeClassname = "observe-img-resize";
const specialBehaviours = {
  generateQuestions: generateQuestionPrompt,
};
type HandleSendBody = {
  text: string;
  specialBehavioursEnabled?: (keyof typeof specialBehaviours)[];
};
export type HandleSend = (body: HandleSendBody) => Promise<void>;

interface AssistantsChatPageProps {}

const AssistantsChatPage: React.FC<AssistantsChatPageProps> = ({}) => {
  const assistantId = "asst_3auQcimRvVz510Ug8cjMSV3z";
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInputDisabled, setMessageInputDisabled] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileEntry[]>([]);
  const [assistantMessageLoading, setAssistantMessageLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const threadId = searchParams?.get("threadId");
  const personaId = searchParams?.get("personaId") ?? undefined;
  const assistantOrPersonaPrefix = personaId
    ? `assistants/${assistantId}/personas/${personaId}`
    : `assistants/${assistantId}`;
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const { userData } = useUserData();
  const userId = userData?.id;

  const openNewThread = useCallback(async () => {
    const { threadId } = await assistantsService.createThread();
    setMessagesLoading(true);
    navigate(
      `${pathname}?${encodeQueryParams({
        threadId,
        personaId,
      })}`
    );
  }, [navigate, pathname, personaId]);
  const fetchMessages = useCallback(async () => {
    if (!threadId) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }
    setMessagesLoading(true);
    const messages = await assistantsService.getMessages({ threadId });
    setMessages(messages);
    setMessagesLoading(false);
  }, [threadId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const { scrollToBottom } = useEnsureScrolledToBottom({
    scrollContainerRef: scrollContainerRef,
    observedImagesClassname: observeImageResizeClassname,
    observerDeps: [messages.length > 0],
    scrollBottomDeps: [
      messages,
      attachedFiles.length > 0,
      runLoading,
      assistantMessageLoading,
    ],
  });

  const { socketRef } = useAssistantsChatSocketListeners({
    runLoading,
    setAssistantMessageLoading,
    setMessages,
    threadId: threadId ?? "",
  });

  const handleSendBodyRef = useRef<HandleSendBody>(undefined);

  const updateConversationTitle = async (firstUserMessage: string) => {
    if (!threadId) return;
    let title = extractTagContent(firstUserMessage, "title");
    if (!title) {
      const result = await experimentsService.getCompletion({
        messages: [
          {
            role: "user",
            content: `
              generate a title for this chat
              based on following conversation
              only respond with the title
              the title should max 50 characters
              don't add double quotes at start and end
              <firstUserMessage>${JSON.stringify(
                firstUserMessage
              )}</firstUserMessage>
              `,
          },
        ],
      });
      title = result.content;
    }

    await jsonDataService.setKey<Conversation>({
      key: `${assistantOrPersonaPrefix}/conversations/${v4()}`,
      value: {
        id: v4(),
        threadId: threadId,
        createdAt: new Date().toISOString(),
        title: title,
      },
    });
    refetchConversations();
  };

  const handleSend: HandleSend = async ({
    text: _text,
    specialBehavioursEnabled,
  }) => {
    if (!threadId) {
      openNewThread();
      handleSendBodyRef.current = { text: _text, specialBehavioursEnabled };
      return;
    }
    if (!assistantId) {
      throw new Error("assistantId is missing");
    }
    if (!userId) throw new Error("userId is missing");
    try {
      const attachments: MessageCreateParams.Attachment[] = [];
      const imageFileIds: string[] = [];
      const imageUrls: Record<string, string> = {};
      attachedFiles.forEach((fileEntry) => {
        const isImage = fileEntry.file.type.startsWith("image/");
        if (fileEntry.fileObject) {
          if (isImage) {
            imageFileIds.push(fileEntry.fileObject.id);
          } else {
            attachments.push({
              file_id: fileEntry.fileObject.id,
              tools: [
                {
                  type: getToolForFile(fileEntry.file.name),
                },
              ],
            });
          }
        }
      });
      setAttachedFiles([]);
      const text = _text
        ? _text
        : attachments?.length || imageFileIds?.length || imageUrls?.length
        ? "Files uploaded"
        : "";

      if (messages.length === 0) {
        updateConversationTitle(text);
      }

      setMessages((prev) => [
        ...prev.filter((m) => (m as any).status !== "error"),
        {
          id: TemporaryUserMessageId,
          role: "user",
          content: [{ type: "text", text: { value: text } }],
        } as any,
      ]);

      const secondaryMessages = [
        ...(specialBehavioursEnabled
          ? specialBehavioursEnabled.map((key) => specialBehaviours[key])
          : []),
      ];

      setRunLoading(true);
      setAssistantMessageLoading(true);
      try {
        const result = await assistantsService.chat({
          threadId,
          assistantId,
          userMessage: text,
          personaId,
          secondaryMessages: secondaryMessages,
          socketId: socketRef.current?.id,
          attachments,
          imageFileIds,
          imageUrls,
        });
      } catch (err: any) {
        const error = err as AxiosError;
        const errorMessage = (error.response?.data as any)?.message;
        console.log({ chatErrorMessage: errorMessage });
        const userErrorMessage =
          environmentVars.APP_ENV === "production" || !errorMessage
            ? "Something went wrong, please try again. If problem persists, continue conversation in a new thread."
            : errorMessage;
        setMessages((prev) => {
          return [
            ...prev,
            {
              id: v4(),
              role: "assistant",
              status: "error",
              content: [{ type: "text", text: { value: userErrorMessage } }],
            } as any,
          ];
        });
      } finally {
        setRunLoading(false);
        setAssistantMessageLoading(false);
      }
    } catch (err: any) {
      console.error(err);
    }
  };
  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;
  useEffect(() => {
    if (threadId && !messagesLoading && handleSendBodyRef.current) {
      if (handleSendBodyRef.current) {
        handleSendRef.current(handleSendBodyRef.current);
        handleSendBodyRef.current = undefined;
      }
    }
  }, [messagesLoading, threadId]);

  const openNewChat = () => {
    navigate(
      `${pathname}?${encodeQueryParams({
        personaId,
      })}`
    );
  };

  const handleFilesChange = async (files: File[]) => {
    if (files) {
      const supportedFiles: File[] = [];
      const unsupportedFiles: File[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext && supportedExtensions.includes(ext)) {
          supportedFiles.push(file);
        } else {
          unsupportedFiles.push(file);
        }
      }
      setAttachedFiles((prev) => [
        ...prev,
        ...supportedFiles.map((file) => ({ id: v4(), file })),
      ]);
      if (unsupportedFiles.length > 0) {
        setTimeout(() => {
          alert(
            `Some of the files you have added are not supported: ${unsupportedFiles
              .map((file) => file.name)
              .join(", ")}`
          );
        }, 500);
      }
    }
  };
  const { dropAreaProps, isDragging } = useDropArea({
    onFilesChange: handleFilesChange,
  });
  const { data: conversations, refetch: refetchConversations } =
    useJsonDataKeysLike<Conversation>(
      `${assistantOrPersonaPrefix}/conversations/${uuidPlaceholder}`
    );

  const conversation = conversations?.find((c) => c.threadId === threadId);

  const historyBlocks = useMemo(() => {
    return getHistoryBlocks(conversations || []);
  }, [conversations]);
  const assistantMessageInProgress =
    messages[messages.length - 1]?.role === "assistant" &&
    messages[messages.length - 1]?.status === "in_progress";
  const lastAssistantRunId =
    messages[messages.length - 1]?.role === "assistant"
      ? messages[messages.length - 1].run_id
      : undefined;
  const renderMessageInput = ({
    showFilesUploadedPreview,
  }: {
    showFilesUploadedPreview: boolean;
  }) => {
    return (
      <div>
        <MessageInput
          handleSend={handleSend}
          interruptEnabled={!!lastAssistantRunId}
          interrupt={() => {
            if (!threadId) return;
            if (lastAssistantRunId) {
              assistantsService
                .cancelRun({ threadId, runId: lastAssistantRunId })
                .catch((err: any) => {
                  // fail silently, if cannot cancel run that is completed
                });
            }
          }}
          loading={assistantMessageLoading || assistantMessageInProgress}
          placeholder={"Message Assistant"}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
          handleFilesChange={handleFilesChange}
          disabled={messageInputDisabled}
          showFilesUploadedPreview={showFilesUploadedPreview}
        />
      </div>
    );
  };

  return (
    <div className="h-screen flex">
      <div className="w-[260px] p-[16px] border-r border-r-input">
        <div>
          <Button
            onClick={() => {
              openNewChat();
            }}
          >
            <NewChatIcon />
            <span>New Chat</span>
          </Button>
        </div>
        <div className="mt-[30px]">
          <div className="space-y-[20px]">
            {historyBlocks.map(([date, items], i) => (
              <HistoryBlock key={i} date={date} conversations={items} />
            ))}
          </div>
        </div>
      </div>
      <div
        className="flex-1 h-full flex flex-col relative"
        style={{
          background: 'url("/images/ai-specialists/BG Textures-min.png")',
          backgroundSize: "cover",
          backgroundPosition: "top left",
        }}
        {...dropAreaProps}
      >
        {isDragging && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="text-gray-100 text-center">
              <p className="text-[18px] font-bold">Add anything</p>
              <p className="text-[14px]">
                Drop any file here to add it to the conversation
              </p>
            </div>
          </div>
        )}
        <div className="border-b border-b-input p-4 flex justify-between items-center">
          <span></span>
          <span>{conversation?.title ?? "New Chat"}</span>
          <ModeToggle />
        </div>
        {messagesLoading ? (
          <>
            <Container centerContent={true}>
              <LoadingSpinner />
            </Container>
            <MessageInputContainer>
              {renderMessageInput({ showFilesUploadedPreview: true })}
            </MessageInputContainer>
          </>
        ) : (
          <>
            {messages.length === 0 ? (
              <>
                <Container centerContent={true}>
                  <div className="w-full">
                    <h1 className="text-center text-4xl mb-[50px]">
                      What can I help with?
                    </h1>
                    <MessageInputContainer>
                      {renderMessageInput({ showFilesUploadedPreview: true })}
                    </MessageInputContainer>
                  </div>
                </Container>
              </>
            ) : (
              <>
                <Container divRef={scrollContainerRef}>
                  <RenderMessages
                    messages={messages}
                    handleSend={handleSend}
                    assistantMessageLoading={assistantMessageLoading}
                    scrollToBottom={scrollToBottom}
                  />
                </Container>
                <MessageInputContainer>
                  {renderMessageInput({ showFilesUploadedPreview: true })}
                </MessageInputContainer>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default AssistantsChatPage;

interface MessageInputContainerProps {
  children: any;
}
const MessageInputContainer: React.FC<MessageInputContainerProps> = ({
  children,
}) => {
  return (
    <div className="m-auto max-w-[800px] pb-[28px] md:pb-[36px] px-[32px] w-full">
      {children}
    </div>
  );
};
