import { Label } from "@radix-ui/react-label";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { produce } from "immer";
import { ArrowDown, Home, PanelLeft, PanelRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { v4 } from "uuid";
import useAuthRequired from "~/hooks/auth/useAuthRequired";
import useCodeRunners from "~/hooks/codeRunners/useCodeRunners";
import {
  getCSVContents,
  pythonCSVPrefix,
  pythonImagePrefix,
} from "~/hooks/codeRunners/usePythonRunner";
import useDropArea from "~/hooks/useDropArea";
import useEnsureScrolledToBottom from "~/hooks/useEnsureScrolledToBottom";
import useGlobalContext from "~/hooks/useGlobalContext";
import useJsonData from "~/hooks/useJsonData";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import useLocalStorageState from "~/hooks/useLocalStorageState";
import useTextStream from "~/hooks/useTextStream";
import useWebSTT from "~/hooks/useWebSTT";
import authService from "~/lib/authService";
import clientTools from "~/lib/clientTools";
import {
  defaultModel,
  Model,
  modelOptions,
  uuidPlaceholder,
} from "~/lib/constants";
import { generateQuestionInstruction } from "~/lib/specialMessageParser";
import {
  Chat,
  Memory,
  Message,
  Persona,
  Tool,
  ToolCall,
  ToolSource,
  ToolVariant,
} from "~/lib/typesJsonData";
import { cn, dataURLtoFile, getCsvFile, html, safeSleep } from "~/lib/utils";
import experimentsService from "~/services/experimentsService";
import NewChatIcon from "../Icons/NewChatIcon";
import ProfileInfo from "../ProfileInfo/ProfileInfo";
import CentralLoader from "../Shared/CentralLoader";
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
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { getHistoryBlocks } from "./Children/History/HistoryBlock/getHistoryBlocks";
import HistoryBlock from "./Children/History/HistoryBlock/HistoryBlock";
import MessageInput from "./Children/MessageInput";
import ModelSelector from "./Children/ModelSelector";
import RenderMessages from "./Children/RenderMessages/RenderMessages";
import { SearchDialog } from "./Children/SearchDialog";
export type HandleSend = ({ text }: { text: string }) => void;
export const observeImageResizeClassname = "observe-img-resize";
export type FileEntry = {
  id: string;
  file?: File;
  fileMetadata?: {
    name: string;
    type: string;
  };
  s3Url?: string;
};

interface ChatPageProps {}
const ChatPage: React.FC<ChatPageProps> = ({}) => {
  const [leftPanelOpen, setLeftPanelOpen] = useLocalStorageState(
    "leftPanelOpen",
    true
  );
  const [rightPanelOpen, setRightPanelOpen] = useLocalStorageState(
    "rightPanelOpen",
    true
  );
  const { id: chatId } = useParams<{ id: string }>();

  const { userData } = useGlobalContext();
  const [toolCallsAndOutputs, setToolCallsAndOutputs] = useState<
    { toolCall: ToolCall; toolCallOutput?: string; isLoading: boolean }[]
  >([]);
  const { data: serverTools, isLoading: toolsLoading } = useQuery({
    queryKey: ["tools"],
    queryFn: () => experimentsService.getTools(),
  });
  const [memories, setMemories, { refetch: refetchMemories }] = useJsonData<
    Memory[]
  >("memories", []);

  // useEffect(() => {
  //   console.log({ memories });
  // }, [memories]);

  const [tools, setTools] = useState<Tool[]>([]);
  const [_model, setModel] = useJsonData<Model>("model", () => {
    return defaultModel;
  });
  const model = _model ?? defaultModel;
  useEffect(() => {
    if (serverTools) {
      setTools([
        ...clientTools,
        ...serverTools.mcpOpenAITools.map((t) => ({
          ...t,
          variant: ToolVariant.serverSide,
          source: ToolSource.mcp,
        })),
        // ...serverTools.composioTools.map((t) => ({
        //   ...t,
        //   variant: ToolVariant.serverSide,
        //   source: ToolSource.composio,
        // })),
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
        const lines = output.split("\n") as string[];
        const newLines = await Promise.all(
          lines.map(async (line) => {
            if (line.startsWith(pythonImagePrefix)) {
              const file = dataURLtoFile(line, "image.png");
              const result = await experimentsService.uploadFileToS3(file);
              return result;
            } else if (line.startsWith(pythonCSVPrefix)) {
              const { fileName, csvContent } = getCSVContents(line);
              const file = getCsvFile({ filename: fileName, csvContent });
              const result = await experimentsService.uploadFileToS3(file);
              return result;
            }
            return line;
          })
        );
        const finalOutput = newLines.join("\n");
        // console.log({ finalOutput });
        handleToolCallOutput({ toolCall, toolCallOutput: finalOutput });
      }
    }
  };
  const handleToolCallOutput = async (entry: {
    toolCall: ToolCall;
    toolCallOutput: string;
  }) => {
    if (entry.toolCall.function.name === "saveUserInfoToMemory") {
      refetchMemories();
    }
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
    reasoningText,
  } = useTextStream({
    handleToolCall,
    handleToolCallOutput,
  });

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
  const [searchParams] = useSearchParams();

  const personaId = searchParams?.get("personaId") ?? undefined;
  const attachPersonaPrefixIfPresent = (key: string) => {
    if (personaId) {
      return `personas/${personaId}/${key}`;
    }
    return key;
  };
  const [preferences, setPreferences] = useJsonData(
    attachPersonaPrefixIfPresent(`preferences`),
    { relatedQuestion: { enabled: false, count: 3 } }
  );
  useEffect(() => {
    console.log({ preferences });
  }, [preferences]);
  const { data: chatHistory, refetch: refetchChatHistory } =
    useJsonDataKeysLike<Chat>(
      attachPersonaPrefixIfPresent(`chats/${uuidPlaceholder}`)
    );
  const [persona] = useJsonData<Persona>(`personas/${personaId}`);

  const navigate = useNavigate();
  useAuthRequired();
  const [chat, setChat, { updating: chatUpdating }] = useJsonData<Chat>(
    attachPersonaPrefixIfPresent(`chats/${chatId}`),
    {
      id: chatId,
      title: "",
      createdAt: new Date().toISOString(),
    }
  );
  const [messages, setMessages, { loading: messagesLoading }] = useJsonData<
    Message[]
  >(attachPersonaPrefixIfPresent(`chats/${chatId}/messages`), []);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<FileEntry[]>([]);

  const { scrollToBottom, autoScrollDisabled } = useEnsureScrolledToBottom({
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
            model,
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
    [model, setChat, setMessages]
  );
  const handleFilesChange = async (files: File[]) => {
    if (files) {
      const supportedFiles: File[] = [];
      const unsupportedFiles: File[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        // if (ext && supportedExtensions.includes(ext)) {
        supportedFiles.push(file);
        // } else {
        //   unsupportedFiles.push(file);
        // }
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
  const hasAssistantMessageForCurrentToolCalls = toolCallsAndOutputs.some(
    (tco) =>
      messages
        ?.slice()
        .reverse()
        .find((m) => m.role === "assistant")
        ?.tool_calls?.some((tc) => tc.id === tco.toolCall.id)
  );

  useEffect(() => {
    const toolsMessages: Message[] = toolCallsAndOutputs.map((tco) => {
      return {
        role: "tool" as const,
        content: tco.toolCallOutput ?? "",
        tool_call_id: tco.toolCall.id,
        id: v4(),
        status: tco.isLoading ? "in_progress" : "completed",
      };
    });
    if (toolsMessages.length > 0) {
      setMessages((prev) => {
        if (prev) {
          return [
            ...(prev ?? []).filter(
              (m) =>
                !(
                  m.role === "tool" &&
                  toolsMessages.some(
                    (tm) =>
                      tm.role === "tool" && tm.tool_call_id === m.tool_call_id
                  )
                )
            ),
            ...toolsMessages,
          ];
        }
        return prev;
      });

      if (
        toolCallsAndOutputs.every((tco) => !tco.isLoading) &&
        hasAssistantMessageForCurrentToolCalls
      ) {
        setToolCallsAndOutputs([]);
        setTimeout(() => {
          handleGenerate({
            tools: modelOptions[model].toolsSupport ? tools : undefined,
            messages: getCurrentMessagesRef.current(),
            onComplete: onGenerateComplete,
            model,
          });
        }, 100);
      }
    }
  }, [
    handleGenerate,
    hasAssistantMessageForCurrentToolCalls,
    model,
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
            const lastMessage = draft[draft.length - 1];
            if (lastMessage.role !== "assistant") {
              draft.push({
                id: v4(),
                role: "assistant",
                content: text,
                status: "in_progress",
              });
            } else if (
              lastMessage.role === "assistant" &&
              typeof lastMessage.content === "string" &&
              lastMessage.content.startsWith("<reasoning_content>")
            ) {
              lastMessage.content =
                lastMessage.content!.slice(
                  0,
                  (lastMessage.content as string).indexOf(
                    "</reasoning_content>"
                  ) + "</reasoning_content>".length
                ) + text;
            } else {
              lastMessage.content = text;
            }
          }
        })
      );
    }
  }, [setMessages, text]);
  useEffect(() => {
    if (reasoningText) {
      setMessages(
        produce((draft) => {
          if (draft) {
            if (draft[draft.length - 1].role !== "assistant") {
              draft.push({
                id: v4(),
                role: "assistant",
                content: `<reasoning_content>${reasoningText}</reasoning_content>`,
                status: "in_progress",
              });
            } else {
              draft[
                draft.length - 1
              ].content = `<reasoning_content>${reasoningText}</reasoning_content>`;
            }
          }
        })
      );
    }
  }, [setMessages, reasoningText]);
  const { dropAreaProps, isDragging } = useDropArea({
    onFilesChange: handleFilesChange,
  });

  const processAttachedFiles = async (userMessage: Message) => {
    if (!model) {
      alert("Please select a model first");
      return;
    }
    if (!Object.keys(modelOptions).includes(model)) {
      alert("Model not specified");
      return;
    }
    const messageIndexTracker: any = {};
    await Promise.all(
      attachedFiles.map(async (fileEntry, index) => {
        const addMessage = async (_message: Message) => {
          await safeSleep(index * 100, true);
          // artificial delay to ensure setMessages is called sequentialy and not in parallel
          const message = JSON.parse(JSON.stringify(_message)) as Message;
          setMessages((prev) => {
            if (prev) {
              const fileRelatedMessages = [
                ...prev.filter(
                  (m) =>
                    Object.keys(messageIndexTracker).includes(m.id) &&
                    m.id !== message.id
                ),
                message,
              ];
              fileRelatedMessages.sort((a, b) => {
                return messageIndexTracker[a.id] - messageIndexTracker[b.id];
              });
              return [
                ...prev.filter(
                  (m) =>
                    ![
                      userMessage.id,
                      ...Object.keys(messageIndexTracker),
                    ].includes(m.id)
                ),
                ...fileRelatedMessages,
                userMessage,
              ];
            }
            return prev;
          });
        };
        const isImage = fileEntry.file!.type.startsWith("image/");
        const messageId = v4();
        messageIndexTracker[messageId] = index;
        let message: Message;
        if (isImage) {
          const imageSupport =
            modelOptions[model as keyof typeof modelOptions].imageSupport;
          if (imageSupport) {
            message = {
              role: "user",
              content: [
                {
                  type: "text",
                  text: fileEntry.file!.name,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: fileEntry.s3Url!,
                  },
                },
              ],
              id: messageId,
              status: "completed",
              type: "image_url",
            };

            await addMessage(message);
          } else {
            const contentObj = {
              fileName: fileEntry.file!.name,
              url: fileEntry.s3Url!,
              content: "",
            };
            message = {
              role: "user",
              content: JSON.stringify(contentObj),
              id: messageId,
              status: "in_progress",
              type: "image_ocr",
            };
            await addMessage(message);
            const result = await experimentsService
              .getUrlContent({ url: fileEntry.s3Url! })
              .fn();
            contentObj.content = result;
            message.content = JSON.stringify(contentObj);
            message.status = "completed";
            await addMessage(message);
          }
        } else {
          const contentObj = {
            fileEntry: {
              fileMetadata: {
                name: fileEntry.file!.name,
                type: fileEntry.file!.type,
              },
              id: fileEntry.id,
              s3Url: fileEntry.s3Url!,
            },
            content: "",
            instruction: html`
              for this file entry, this is the parsed content, user has attached
              this file, use the file file contents to answer the user query
            `,
          };
          message = {
            role: "user",
            content: JSON.stringify(contentObj),
            id: messageId,
            status: "in_progress",
            type: "file",
          };
          await addMessage(message);
          const result = await experimentsService
            .getUrlContent({ url: fileEntry.s3Url! })
            .fn();
          // return result;
          contentObj.content = result;
          message.content = JSON.stringify(contentObj);
          message.status = "completed";
          await addMessage(message);
        }
      })
    );
  };

  const getCurrentMessages = () => {
    if (!memories) {
      alert("memories not loaded");
      return [];
    }
    if (!preferences) {
      alert("preferences not loaded");
      return [];
    }
    const userInstruction = html`
      you are currently interacting with following user -
      <userData>${JSON.stringify(userData)}</userData>
    `;
    const memoryInstruction = html`
      Following memory statements are gathered from previous conversations with
      the user, try to incorporate them into the conversation context to provide
      a more personalized response.
      <statements> ${memories.map((m) => m.statement).join(", ")} </statements>

      additionally, if user has revealed something new about himself in the
      conversation so far, save that statement in the memory using the tool
      saveUserInfoToMemory
    `;

    const currentDate = format(new Date(), "EEEE, MMMM do, yyyy HH:mm:ss");
    const generalInstruction = html`
      <div>
        <div>
          use getUrlContent only sparingly, don't fetch the file contents, if
          you already have them in tool_call output
        </div>
        <div>
          <span>Current Date: ${currentDate}</span>
          <span
            >This is the time and date in user's timezone, when the query is
            made to you, use this date to ensure you use the latest information
            from googleSearch tool
          </span>
        </div>
      </div>
    `;

    const initialInstructions: string[] = [];
    initialInstructions.push(userInstruction);
    initialInstructions.push(memoryInstruction);
    initialInstructions.push(generalInstruction);
    if (persona) {
      const personaInstruction = html`
        you are persona with following personality
        <persona>${JSON.stringify(persona)}</persona>
        you have to respond on persona's behalf additionally since, user is
        interacting with this persona, retrieveRelevantDocs tool becomes
        important use this collectionName - ${persona.collectionName} so make
        sure to pass user query to that tool and fetch the relevant docs and
        respond accordingly persona has data from various sources like websites,
        pdfs, and it needs to answer based on that information
      `;
      initialInstructions.push(personaInstruction);
    }

    const initialMessages: Message[] = initialInstructions.map((content) => {
      return {
        id: v4(),
        status: "completed",
        role: "system",
        content: content,
      };
    });

    const additionalInstructions: string[] = [];
    if (preferences.relatedQuestion.enabled) {
      additionalInstructions.push(
        generateQuestionInstruction(preferences.relatedQuestion.count || 3)
      );
    } else {
      additionalInstructions.push(
        "user has disabled generateQuestionInstruction, no need to generate anymore"
      );
    }
    const additionalMessages: Message[] = additionalInstructions.map(
      (content) => {
        return {
          id: v4(),
          status: "completed",
          role: "user",
          content: content,
        };
      }
    );
    const finalMessages = (messages ?? []).map((m) => {
      if (
        m.role === "assistant" &&
        typeof m.content === "string" &&
        m.content.startsWith("<reasoning_content>")
      ) {
        return {
          ...m,
          content: m.content.slice(
            m.content.indexOf("</reasoning_content>") +
              "</reasoning_content>".length
          ),
        };
      }
      return m;
    });
    return [
      ...initialMessages,
      ...finalMessages,
      ...(modelOptions[model].successiveMessagesSupport
        ? additionalMessages
        : []),
    ];
  };
  const getCurrentMessagesRef = useRef(getCurrentMessages);
  getCurrentMessagesRef.current = getCurrentMessages;
  const { deductCredits } = useGlobalContext();

  const handleSend: HandleSend = async ({ text }) => {
    const hasRemainingCredits = await deductCredits();
    if (!hasRemainingCredits) return;

    setAttachedFiles([]);
    const userMessage: Message = {
      id: v4(),
      role: "user",
      content: text,
      status: "completed",
    };
    setMessages((prev) => [...(prev ?? []), userMessage]);
    setTimeout(() => {
      scrollToBottom(true);
    }, 100);
    // process attached files
    await processAttachedFiles(userMessage);
    setTimeout(() => {
      handleGenerate({
        messages: getCurrentMessagesRef.current(),
        tools: modelOptions[model].toolsSupport ? tools : undefined,
        onComplete: onGenerateComplete,
        model,
      });
    }, 100);
  };
  const openNewChat = () => {
    if (personaId) {
      navigate(`/chat/${v4()}?personaId=${personaId}`);
    } else {
      navigate(`/chat/${v4()}`);
    }
  };
  const historyBlocks = useMemo(() => {
    return getHistoryBlocks(chatHistory || []);
  }, [chatHistory]);
  const renderMessageInput = () => {
    return (
      <MessageInput
        handleSend={handleSend}
        loading={textStreamLoading}
        interrupt={() => {}}
        disabled={!model}
        placeholder="Message"
        interruptEnabled={false}
        handleFilesChange={handleFilesChange}
        attachedFiles={attachedFiles}
        setAttachedFiles={setAttachedFiles}
      />
    );
  };
  return (
    <div className="h-screen flex">
      {leftPanelOpen && (
        <div className="w-[260px] border-r border-r-input h-full flex flex-col">
          <div className="p-[16px] flex justify-between items-center">
            <Button
              onClick={() => {
                openNewChat();
              }}
            >
              <NewChatIcon />
              <span>New Chat</span>
            </Button>
            <SearchDialog />
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
      )}
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
          <span className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setLeftPanelOpen((prev) => !prev);
              }}
            >
              <PanelLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                openNewChat();
              }}
            >
              <NewChatIcon />
            </Button>
            <Link to="/">
              <Button variant="outline" size="icon">
                <Home />
              </Button>
            </Link>
          </span>
          <span>{chat?.title || "New Chat"}</span>
          <span className="flex gap-2">
            <ModeToggle />

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setRightPanelOpen((prev) => !prev);
              }}
            >
              <PanelRight />
            </Button>
          </span>
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
            {messages?.length === 0 ? (
              <>
                <Container centerContent={true}>
                  <div className="w-[800px]">
                    {personaId && !persona ? (
                      <CentralLoader />
                    ) : (
                      <>
                        <div className="text-center">
                          {persona ? (
                            <div>
                              <h1 className="text-3xl">{persona.name}</h1>
                              <p>{persona.description}</p>
                            </div>
                          ) : (
                            <div>
                              <h1 className="text-4xl">
                                What can I help with?
                              </h1>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </Container>
                <MessageInputContainer>
                  {renderMessageInput()}
                </MessageInputContainer>
              </>
            ) : (
              <>
                <Container divRef={scrollContainerRef}>
                  <RenderMessages
                    scrollToBottom={scrollToBottom}
                    messages={messages ?? []}
                    handleSend={handleSend}
                    hadPendingToolCalls={toolCallsAndOutputs.length > 0}
                    scrollContainerRef={scrollContainerRef}
                  />
                </Container>
                <div className="relative">
                  <div className="absolute right-1/2 -translate-x-1/2 translate-y-[-60px]">
                    <div
                      className={cn(
                        "transition-opacity",
                        autoScrollDisabled ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <Button
                        onClick={() => {
                          scrollToBottom(true);
                        }}
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                      >
                        <ArrowDown />
                      </Button>
                    </div>
                  </div>
                </div>

                <MessageInputContainer>
                  {renderMessageInput()}
                </MessageInputContainer>
              </>
            )}
          </>
        )}
      </div>
      {rightPanelOpen && preferences && model && (
        <div className="w-[260px] border-l border-l-input h-full flex flex-col">
          <div className="p-4">
            <div>
              <div className="flex items-center space-x-2">
                <Switch
                  disabled={!modelOptions[model].successiveMessagesSupport}
                  id="related-questions"
                  checked={
                    modelOptions[model].successiveMessagesSupport &&
                    preferences.relatedQuestion.enabled
                  }
                  onCheckedChange={(value) => {
                    setPreferences(
                      produce((draft) => {
                        if (!draft) return;
                        draft.relatedQuestion.enabled = value;
                      })
                    );
                  }}
                />
                <Label htmlFor="related-questions">Related Questions</Label>
              </div>
              {modelOptions[model].successiveMessagesSupport &&
                preferences.relatedQuestion.enabled && (
                  <>
                    <div className="h-4"></div>
                    <div>
                      <Input
                        type="number"
                        placeholder="3"
                        min={1}
                        max={5}
                        value={
                          preferences.relatedQuestion.count === 0
                            ? ""
                            : preferences.relatedQuestion.count
                        }
                        onChange={(e) => {
                          setPreferences(
                            produce((draft) => {
                              if (!draft) return;
                              const value = +e.target.value;
                              if (value > 5) return;
                              draft.relatedQuestion.count = value;
                            })
                          );
                        }}
                      />
                    </div>
                  </>
                )}
            </div>
            <div className="h-4"></div>
            <div>
              <ModelSelector model={model} setModel={setModel} />
            </div>
          </div>
        </div>
      )}
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
