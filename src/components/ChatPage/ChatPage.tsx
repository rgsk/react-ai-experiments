import { useQuery } from "@tanstack/react-query";
import { produce } from "immer";
import { Home } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { v4 } from "uuid";
import useAuthRequired from "~/hooks/auth/useAuthRequired";
import useCodeRunners from "~/hooks/codeRunners/useCodeRunners";
import useDropArea from "~/hooks/useDropArea";
import useEnsureScrolledToBottom from "~/hooks/useEnsureScrolledToBottom";
import useJsonData from "~/hooks/useJsonData";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import useTextStream from "~/hooks/useTextStream";
import useWebSTT from "~/hooks/useWebSTT";
import authService from "~/lib/authService";
import clientTools from "~/lib/clientTools";
import { uuidPlaceholder } from "~/lib/constants";
import { Chat, Message } from "~/lib/typesJsonData";
import experimentsService, {
  Tool,
  ToolCall,
  ToolSource,
  ToolVariant,
} from "~/services/experimentsService";
import NewChatIcon from "../Icons/NewChatIcon";
import ProfileInfo from "../ProfileInfo/ProfileInfo";
import Container from "../Shared/Container";
import { DraggingBackdrop } from "../Shared/DraggingBackdrop";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
import { ModeToggle } from "../Shared/ModeToggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { getHistoryBlocks } from "./Children/History/HistoryBlock/getHistoryBlocks";
import HistoryBlock from "./Children/History/HistoryBlock/HistoryBlock";
import MessageInput from "./Children/MessageInput";
import RenderMessages from "./Children/RenderMessages/RenderMessages";
export type HandleSend = ({ text }: { text: string }) => void;
export const observeImageResizeClassname = "observe-img-resize";

interface ChatPageProps {}
const ChatPage: React.FC<ChatPageProps> = ({}) => {
  const { id: chatId } = useParams<{ id: string }>();
  const [toolCallsAndOutputs, setToolCallsAndOutputs] = useState<
    { toolCall: ToolCall; toolCallOutput?: string; isLoading: boolean }[]
  >([]);
  const { data: serverTools, isLoading: toolsLoading } = useQuery({
    queryKey: ["tools"],
    queryFn: () => experimentsService.getTools(),
  });
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    if (serverTools) {
      setTools([
        ...clientTools,
        ...serverTools.mcpOpenAITools
          .filter((t) => t.function.name !== "executeCode")
          .map((t) => ({
            ...t,
            variant: ToolVariant.serverSide,
            source: ToolSource.mcp,
          })),
        ...serverTools.composioTools.map((t) => ({
          ...t,
          variant: ToolVariant.serverSide,
          source: ToolSource.composio,
        })),
      ]);
    }
  }, [serverTools]);
  const { runCode } = useCodeRunners();
  const handleToolCall = async (toolCall: ToolCall) => {
    // console.log({ toolCall });
    setToolCallsAndOutputs((prev) => [...prev, { toolCall, isLoading: true }]);
    if (toolCall.variant === ToolVariant.serverSideRequiresPermission) {
      let output = "";
      const permission = confirm(
        `should I execute ${toolCall.function.name}, with args ${JSON.stringify(
          toolCall.function.arguments
        )}`
      );
      if (permission) {
        const res = await experimentsService.executeTool(toolCall);
        output = res.output;
      } else {
        output = "user did not grant permission to run this tool";
      }
      handleToolCallOutput({ toolCall, toolCallOutput: output });
    } else if (toolCall.variant === ToolVariant.clientSide) {
      if (toolCall.function.name === "executeCode") {
        const { code, language } = toolCall.function.arguments;
        const output = await runCode({ code, language });
        handleToolCallOutput({ toolCall, toolCallOutput: output });
      }
    }
  };
  const handleToolCallOutput = async (entry: {
    toolCall: ToolCall;
    toolCallOutput: string;
  }) => {
    setToolCallsAndOutputs((prev) =>
      prev.map((e) => {
        if (e.toolCall.id === entry.toolCall.id) {
          return {
            ...e,
            toolCallOutput: entry.toolCallOutput,
            isLoading: false,
          };
        }
        return e;
      })
    );
  };
  const {
    handleGenerate,
    loading: textStreamLoading,
    text,
  } = useTextStream({ handleToolCall, handleToolCallOutput });

  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [voiceModeLoading, setVoiceModeLoading] = useState(false);
  const handleMessageDelta = ({
    delta,
    role,
    transcript,
  }: {
    delta?: string;
    transcript?: string;
    role: "user" | "assistant";
  }) => {
    setMessages((prev) => {
      const lastMessage = prev?.[prev.length - 1];
      if (lastMessage?.role === role && lastMessage.status === "in_progress") {
        // Update the existing last message
        const updatedMessage = {
          ...lastMessage,
          content: transcript
            ? transcript
            : (lastMessage.content ?? "") + (delta ?? ""),
        };
        return [...prev!.slice(0, -1), updatedMessage];
      }
      // Create a new message
      const newMessage: Message = {
        id: v4(),
        role: role,
        content: transcript ?? delta ?? "",
        status: "in_progress",
      };
      return [...(prev ?? []), newMessage];
    });
  };
  const markLastMessageAsComplete = (role: "user" | "assistant") => {
    // get the last user message and mark it as complete
    setMessages((prev) => {
      if (!prev) return prev;
      // Find the last user message index
      let lastUserIndex = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === role) {
          lastUserIndex = i;
          break;
        }
      }
      // If found, update it with final transcript
      if (lastUserIndex !== -1) {
        const updatedMessages = [...prev];
        updatedMessages[lastUserIndex] = {
          ...updatedMessages[lastUserIndex],
          status: "completed",
        };
        return updatedMessages;
      }

      return prev;
    });
  };
  const { startRecognition, stopRecognition } = useWebSTT({
    onFinalTranscript: () => {
      markLastMessageAsComplete("user");
    },
    onInterimTranscript: (transcript) => {
      handleMessageDelta({ role: "user", transcript: transcript });
    },
  });
  const { data: chatHistory, refetch: refetchChatHistory } =
    useJsonDataKeysLike<Chat>(`chats/${uuidPlaceholder}`);
  const navigate = useNavigate();
  useAuthRequired();
  const [chat, setChat, { updating: chatUpdating }] = useJsonData<Chat>(
    `chats/${chatId}`,
    {
      id: chatId,
      title: "",
      createdAt: new Date().toISOString(),
    }
  );
  const [messages, setMessages, { loading: messagesLoading }] = useJsonData<
    Message[]
  >(`chats/${chatId}/messages`, []);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const { scrollToBottom } = useEnsureScrolledToBottom({
    scrollContainerRef: scrollContainerRef,
    observedImagesClassname: observeImageResizeClassname,
    observerDeps: [(messages?.length ?? 0) > 0],
    scrollBottomDeps: [messages],
  });

  const chatRef = useRef(chat);
  chatRef.current = chat;
  useEffect(() => {
    if (chat?.title && !chatUpdating) {
      refetchChatHistory();
    }
  }, [chat?.title, chatUpdating, refetchChatHistory]);
  const onGenerateComplete = useCallback(
    async ({ toolCalls }: { toolCalls: ToolCall[] }) => {
      setTimeout(() => {
        setMessages(
          produce((draft) => {
            if (draft && draft[draft.length - 1].role === "assistant") {
              if (toolCalls.length > 0) {
                draft[draft.length - 1].tool_calls = toolCalls;
              }
              draft[draft.length - 1].status = "completed";
            } else {
              if (toolCalls.length > 0) {
                draft?.push({
                  role: "assistant",
                  status: "completed",
                  tool_calls: toolCalls,
                  id: v4(),
                  content: `calling tools - ${toolCalls
                    .map((tc) => tc.function.name)
                    .join(", ")}`,
                });
              }
            }
          })
        );
      }, 100);
      if (!chatRef.current?.title) {
        const currentMessages = messagesRef.current;
        if (currentMessages) {
          // set the title of chat based on current messages
          const { content: title } = await experimentsService.getCompletion({
            messages: [
              {
                role: "user",
                content: `
              generate a title for this chat
              based on following conversation
              only respond with the title
              the title should max 50 characters
              don't add double quotes at start and end
              <currentMessages>${JSON.stringify(
                currentMessages
              )}</currentMessages>
              `,
              },
            ],
          });
          setChat((prev) => {
            if (prev) {
              return {
                ...prev,
                title,
              };
            }
            return prev;
          });
        }
      }
    },
    [setChat, setMessages]
  );

  useEffect(() => {
    const lastAssistantMessage = messages
      ?.slice()
      ?.reverse()
      .find((m) => m.role === "assistant" && m.status === "completed");
    if (
      messages &&
      lastAssistantMessage?.tool_calls?.some((tc) =>
        toolCallsAndOutputs.some((tco) => tco.toolCall.id === tc.id)
      )
    ) {
      const toolsMessages: Message[] = toolCallsAndOutputs
        .filter(
          (tc) =>
            !tc.isLoading &&
            !messages.some(
              (m) => m.role === "tool" && m.tool_call_id === tc.toolCall.id
            )
        )
        .map((tco) => {
          return {
            role: "tool" as const,
            content: tco.toolCallOutput!,
            tool_call_id: tco.toolCall.id,
            id: v4(),
            status: "completed",
          };
        });
      if (toolsMessages.length > 0) {
        setMessages((prev) => {
          if (prev) {
            return [...(prev ?? []), ...toolsMessages];
          }
          return prev;
        });

        if (
          toolCallsAndOutputs.filter((tco) => !tco.isLoading).length ===
          lastAssistantMessage.tool_calls?.length
        ) {
          setToolCallsAndOutputs([]);
          setTimeout(() => {
            handleGenerate({
              tools: tools,
              messages: messagesRef.current ?? [],
              onComplete: onGenerateComplete,
            });
          }, 100);
        }
      }
    }
  }, [
    handleGenerate,
    messages,
    onGenerateComplete,
    setMessages,
    toolCallsAndOutputs,
    tools,
  ]);

  useEffect(() => {
    if (text) {
      setMessages(
        produce((draft) => {
          if (draft) {
            if (draft[draft.length - 1].role !== "assistant") {
              draft.push({
                id: v4(),
                role: "assistant",
                content: text,
                status: "in_progress",
              });
            } else {
              draft[draft.length - 1].content = text;
            }
          }
        })
      );
    }
  }, [setMessages, text]);
  const { dropAreaProps, isDragging } = useDropArea({
    onFilesChange: (files) => {},
  });

  const handleSend: HandleSend = ({ text }) => {
    setMessages((prev) => [
      ...(prev ?? []),
      { id: v4(), role: "user", content: text, status: "completed" },
    ]);
    setTimeout(() => {
      handleGenerate({
        messages: messagesRef.current ?? [],
        tools: tools,
        onComplete: onGenerateComplete,
      });
    }, 100);
  };
  const openNewChat = () => {
    navigate(`/chat/${v4()}`);
  };
  const historyBlocks = useMemo(() => {
    return getHistoryBlocks(chatHistory || []);
  }, [chatHistory]);
  if (!chat || !messages || !chatHistory) {
    return <div>Loading...</div>;
  }
  const renderMessageInput = () => {
    return (
      <MessageInput
        handleSend={handleSend}
        loading={textStreamLoading}
        interrupt={() => {}}
        placeholder="Message"
        interruptEnabled={false}
      />
    );
  };
  return (
    <div className="h-screen flex">
      <div className="w-[260px] border-r border-r-input h-full flex flex-col">
        <div className="p-[16px]">
          <Button
            onClick={() => {
              openNewChat();
            }}
          >
            <NewChatIcon />
            <span>New Chat</span>
          </Button>
        </div>
        <div className="flex-1 overflow-auto space-y-[20px] px-[16px]">
          {historyBlocks.map(([date, items], i) => (
            <HistoryBlock key={i} date={date} chats={items} />
          ))}
        </div>
        <div className="p-[16px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span>
                <ProfileInfo />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent avoidCollisions align="start" side="top">
              <DropdownMenuItem onClick={authService.logout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        {isDragging && <DraggingBackdrop />}
        <div className="border-b border-b-input p-4 flex justify-between items-center">
          <span>
            <Link to="/">
              <Button variant="outline" size="icon">
                <Home />
              </Button>
            </Link>
          </span>
          <span>{chat?.title || "New Chat"}</span>
          <ModeToggle />
        </div>
        {messagesLoading ? (
          <>
            <Container centerContent={true}>
              <LoadingSpinner />
            </Container>
            <MessageInputContainer>
              {renderMessageInput()}
            </MessageInputContainer>
          </>
        ) : (
          <>
            {messages.length === 0 ? (
              <>
                <Container centerContent={true}>
                  <div className="w-[800px]">
                    <div className="flex w-full justify-center">
                      <h1 className="text-4xl">What can I help with?</h1>
                    </div>
                  </div>
                </Container>
                <MessageInputContainer>
                  {renderMessageInput()}
                </MessageInputContainer>
              </>
            ) : (
              <>
                <Container divRef={scrollContainerRef}>
                  <RenderMessages messages={messages} handleSend={handleSend} />
                </Container>
                <MessageInputContainer>
                  {renderMessageInput()}
                </MessageInputContainer>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
  // return (
  //   <div>
  //     <Button
  //       onClick={() => {
  //         navigate(`/chat/${v4()}`);
  //       }}
  //     >
  //       New Chat
  //     </Button>
  //     <div className="flex gap-8">
  //       <div className="min-w-[500px]">
  //         <div className="flex flex-col">
  //           {chatHistory
  //             .filter((c) => !!c.title)
  //             .map((chat) => {
  //               return (
  //                 <div key={chat.id}>
  //                   <p>{chat.id}</p>
  //                   <NavLink to={`/chat/${chat.id}`}>{chat.title}</NavLink>
  //                 </div>
  //               );
  //             })}
  //         </div>
  //       </div>
  //       <div>
  //         <h1>{chat.title || "New Chat"}</h1>
  //         {messages.map((message, i) => (
  //           <div key={`id: ${message.id}, index - ${i}`}>
  //             <p>{message.role}: </p>{" "}
  //             {/* IMPORTANT: using MemoizedMarkdownRenderer is essential here, to prevent rerenders */}
  //             <MemoizedMarkdownRenderer
  //               loading={message.status === "in_progress"}
  //             >
  //               {(message.content ?? "") as string}
  //             </MemoizedMarkdownRenderer>
  //           </div>
  //         ))}

  //         <MessageInput
  //           handleSend={handleSend}
  //           loading={textStreamLoading}
  //           interrupt={() => {}}
  //           placeholder="Message"
  //           interruptEnabled={false}
  //         />
  //         {voiceModeLoading ? (
  //           <div>
  //             <p>Initialising Voice Mode...</p>
  //             <LoadingSpinner />
  //           </div>
  //         ) : voiceModeEnabled ? (
  //           <p>Voice Mode Running</p>
  //         ) : null}
  //         <div className="flex gap-2">
  //           <div>
  //             <Button
  //               onClick={() => {
  //                 setVoiceModeEnabled(true);
  //                 setVoiceModeLoading(true);
  //               }}
  //               disabled={voiceModeEnabled}
  //             >
  //               Start
  //             </Button>
  //           </div>
  //           <div>
  //             <Button
  //               onClick={() => {
  //                 setVoiceModeEnabled(false);
  //                 stopRecognition();
  //               }}
  //               disabled={!voiceModeEnabled}
  //             >
  //               Stop
  //             </Button>
  //           </div>
  //         </div>
  //         <OpenAIRealtimeWebRTC
  //           onDataChannelOpened={() => {
  //             setVoiceModeLoading(false);
  //             startRecognition();
  //           }}
  //           onUserSpeechStarted={() => {
  //             startRecognition();
  //           }}
  //           onUserSpeechStopped={() => {
  //             stopRecognition();
  //           }}
  //           isEnabled={voiceModeEnabled}
  //           onAssistantTranscript={() => {
  //             markLastMessageAsComplete("assistant");
  //           }}
  //           onAssistantTranscriptDelta={(delta) => {
  //             handleMessageDelta({ role: "assistant", delta: delta });
  //           }}
  //           onAssistantSpeechStopped={() => {
  //             // assistant audio response is complete
  //             startRecognition();
  //           }}
  //           initialMessages={messages}
  //         />
  //       </div>
  //     </div>
  //   </div>
  // );
};
export default ChatPage;

interface MessageInputContainerProps {
  children: any;
}
const MessageInputContainer: React.FC<MessageInputContainerProps> = ({
  children,
}) => {
  return (
    <div className="m-auto max-w-[800px] pb-[28px] w-full">{children}</div>
  );
};
