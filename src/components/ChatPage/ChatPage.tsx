import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { produce } from "immer";
import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  Preferences,
  Tool,
  ToolCall,
  ToolSource,
  ToolVariant,
} from "~/lib/typesJsonData";
import {
  cn,
  dataURLtoFile,
  downloadContentFile,
  getCsvFile,
  html,
  safeSleep,
} from "~/lib/utils";
import experimentsService from "~/services/experimentsService";
import CentralLoader from "../Shared/CentralLoader";
import Container from "../Shared/Container";
import { DraggingBackdrop } from "../Shared/DraggingBackdrop";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
import { Button } from "../ui/button";
import { getHistoryBlocks } from "./Children/History/HistoryBlock/getHistoryBlocks";
import LeftPanel from "./Children/LeftPanel/LeftPanel";
import MessageInput from "./Children/MessageInput";
import RenderMessages from "./Children/RenderMessages/RenderMessages";
import RightPanel from "./Children/RightPanel/RightPanel";
import TopPanel from "./Children/TopPanel/TopPanel";
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

const preProcessMessages = (messages: Message[]) => {
  return messages.map((m) => {
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
};

function mergeUserMessages(messages: Message[]): Message[] {
  const result: Message[] = [];
  let userContentBuffer = "";

  for (const message of messages) {
    if (message.role === "user") {
      userContentBuffer += message.content + "\n";
    } else {
      if (userContentBuffer) {
        result.push({
          id: v4(),
          status: "completed",
          role: "user",
          content: userContentBuffer,
        });
        userContentBuffer = "";
      }
      result.push(message);
    }
  }

  if (userContentBuffer) {
    result.push({
      id: v4(),
      status: "completed",
      role: "user",
      content: userContentBuffer,
    });
  }

  return result;
}

function createMarkdownContent(messages: Message[]): string {
  let markdownContent = "# Chat Export\n\n";
  messages.forEach((message) => {
    const role = message.role.charAt(0).toUpperCase() + message.role.slice(1);
    if (message.role === "user" || message.role === "assistant") {
      if (
        !(
          typeof message.content === "string" &&
          message.content.startsWith("calling tools - ")
        )
      ) {
        markdownContent += `## ${role}\n\n${message.content}\n\n`;
      }
    }
  });
  return markdownContent;
}

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
    {
      toolCall: ToolCall;
      toolCallOutput?: string;
      isLoading: boolean;
      chatId: string;
    }[]
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

    setToolCallsAndOutputs((prev) => [
      ...prev,
      { toolCall, isLoading: true, chatId: chatId! },
    ]);
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
        let output = "";
        try {
          output = await runCode({ code, language });
        } catch (err: any) {
          // console.error(err);
          output = `Error: ${err.message}`;
        }
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
    handleStop,
    toolCallsInProgress,
  } = useTextStream({
    handleToolCall,
    handleToolCallOutput,
  });

  const localHandleStop = () => {
    handleStop();
    setToolCallsAndOutputs([]);
  };

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
  const [preferences, setPreferences] = useJsonData<Preferences>(
    attachPersonaPrefixIfPresent(`preferences`),
    () => {
      return {
        instructions: {
          enabled: true,
          children: {
            userDetails: { enabled: true },
            memory: { enabled: true },
            currentDate: { enabled: true },
            persona: { enabled: true },
            relatedQuestion: { enabled: false, count: 3 },
          },
        },
      };
    },
    {}
  );
  useEffect(() => {
    console.log({ preferences });
  }, [preferences]);
  const { data: chatHistory, refetch: refetchChatHistory } =
    useJsonDataKeysLike<Chat>({
      key: attachPersonaPrefixIfPresent(`chats/${uuidPlaceholder}`),
    });
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
  const [processAttachedFilesLoading, setProcessAttachedFilesLoading] =
    useState(false);

  const chatRef = useRef(chat);
  chatRef.current = chat;
  useEffect(() => {
    refetchChatHistory();
  }, [chatId, refetchChatHistory]);
  useEffect(() => {
    if (chat?.title && !chatUpdating) {
      refetchChatHistory();
    }
  }, [chat?.title, chatUpdating, refetchChatHistory]);
  const onGenerateComplete = useCallback(
    async ({ toolCalls }: { toolCalls: ToolCall[] }) => {
      await safeSleep(100, true);
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
        }),
        openNewChatLoadingRef.current
      );
      await safeSleep(100, true);
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
                preProcessMessages(currentMessages ?? [])
              )}</currentMessages>
              `,
              },
            ],
            model: "openai/gpt-4o-mini",
          });
          setChat((prev) => {
            if (prev) {
              return {
                ...prev,
                title,
              };
            }
            return prev;
          }, openNewChatLoadingRef.current);
        }
      }
      if (openNewChatLoadingRef.current) {
        openNewChatRef.current();
      }
    },
    [setChat, setMessages]
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
  const exportChat = () => {
    if (!messages || !chat || !chat.title) return;
    const markdown = createMarkdownContent(messages);
    downloadContentFile({
      content: markdown,
      filename: `Chat: ${chat.title}.md`,
    });
  };

  const processAttachedFiles = async (userMessage: Message) => {
    setProcessAttachedFilesLoading(true);
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
            instruction: "",
            summary: "",
            type: "",
          };
          message = {
            role: "user",
            content: JSON.stringify(contentObj),
            id: messageId,
            status: "in_progress",
            type: "file",
          };
          await addMessage(message);
          const result = await experimentsService.processFileMessage({
            s3Url: fileEntry.s3Url!,
            collectionName: chatId!,
          });
          contentObj.type = result.type;
          if (result.type === "full") {
            contentObj.content = result.content;
            contentObj.instruction = html`
              for this file entry, this is the parsed content, user has attached
              this file, use the file contents to answer the user query
            `;
          } else if (result.type === "rag") {
            contentObj.summary = result.summary;
            contentObj.instruction = html`
              <span>
                this file is attached by the user in this chat, based on the
                summary of this file, you can decide to perform rag on this file
                or not
              </span>

              here are it's creds that you can use to call the tool
              retrieveRelevantDocs:
              ${JSON.stringify({
                source: fileEntry.s3Url!,
                collectionName: chatId!,
              })}
            `;
          }
          // return result;
          message.content = JSON.stringify(contentObj);
          message.status = "completed";
          await addMessage(message);
        }
      })
    );
    setProcessAttachedFilesLoading(false);
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
    const userDetailsInstruction = html`
      you are currently interacting with following user -
      <userData>${JSON.stringify(userData)}</userData>
    `;
    const memoryInstruction = html`
      Following memory statements are gathered from previous conversations with
      the user, try to incorporate them into the conversation context to provide
      a more personalized response.
      <statements> ${memories.map((m) => m.statement).join(", ")} </statements>

      ${modelOptions[model].toolsSupport
        ? html`
            additionally, if user has revealed something new about himself in
            the conversation so far, save that statement in the memory using the
            tool saveUserInfoToMemory
          `
        : ``}
    `;

    const currentDate = format(new Date(), "EEEE, MMMM do, yyyy HH:mm:ss");
    const currentDateInstruction = html`
      <span>Current Date: ${currentDate}</span>
    `;
    const googleSearchInstruction = html`
      <span
        >when the query is made to you, use Current Date to ensure you use the
        latest information from googleSearch tool
      </span>
    `;

    const initialInstructions: string[] = [];
    if (preferences.instructions.enabled) {
      if (preferences.instructions.children.userDetails.enabled) {
        initialInstructions.push(userDetailsInstruction);
      }
      if (preferences.instructions.children.memory.enabled) {
        initialInstructions.push(memoryInstruction);
      }
      if (preferences.instructions.children.currentDate.enabled) {
        initialInstructions.push(currentDateInstruction);
      }
      if (modelOptions[model].toolsSupport) {
        initialInstructions.push(googleSearchInstruction);
      }
      if (persona) {
        if (preferences.instructions.children.persona.enabled) {
          const personaInstruction = html`
            you are persona with following personality
            <persona>${JSON.stringify(persona)}</persona>
            you have to respond on persona's behalf
            ${modelOptions[model].toolsSupport
              ? html`
                  additionally since, user is interacting with this persona,
                  retrieveRelevantDocs tool becomes important use this
                  collectionName - ${persona.collectionName} so make sure to
                  pass user query to that tool and fetch the relevant docs and
                  respond accordingly persona has data from various sources like
                  websites, pdfs, and it needs to answer based on that
                  information
                `
              : ""}
          `;
          initialInstructions.push(personaInstruction);
        }
      }
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
    if (preferences.instructions.enabled) {
      if (preferences.instructions.children.relatedQuestion.enabled) {
        additionalInstructions.push(
          generateQuestionInstruction(
            preferences.instructions.children.relatedQuestion.count || 3
          )
        );
      }
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
    const finalMessages = preProcessMessages(messages ?? []);
    if (modelOptions[model].successiveMessagesSupport) {
      return [...initialMessages, ...finalMessages, ...additionalMessages];
    } else {
      return mergeUserMessages([
        ...initialMessages,
        ...finalMessages,
        ...additionalMessages,
      ]);
    }
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
  const [openNewChatLoading, setOpenNewChatLoading] = useState(false);
  const openNewChat = () => {
    setOpenNewChatLoading(true);
    localHandleStop();
    if (!textStreamLoading) {
      setOpenNewChatLoading(false);
      if (personaId) {
        navigate(`/chat/${v4()}?personaId=${personaId}`);
      } else {
        navigate(`/chat/${v4()}`);
      }
    }
  };
  const openNewChatLoadingRef = useRef(openNewChatLoading);
  openNewChatLoadingRef.current = openNewChatLoading;
  const openNewChatRef = useRef(openNewChat);
  openNewChatRef.current = openNewChat;
  const historyBlocks = useMemo(() => {
    return getHistoryBlocks(chatHistory?.data.map(({ value }) => value) || []);
  }, [chatHistory]);

  const assistantMessageLoading =
    toolCallsInProgress ||
    toolCallsAndOutputs.length > 0 ||
    processAttachedFilesLoading ||
    (textStreamLoading && !text && !reasoningText);

  const renderMessageInput = () => {
    return (
      <MessageInput
        handleSend={handleSend}
        loading={toolCallsInProgress || textStreamLoading}
        interrupt={localHandleStop}
        disabled={!model}
        placeholder="Message"
        interruptEnabled={true}
        handleFilesChange={handleFilesChange}
        attachedFiles={attachedFiles}
        setAttachedFiles={setAttachedFiles}
      />
    );
  };
  return (
    <div className="h-screen flex">
      {leftPanelOpen && (
        <LeftPanel
          openNewChat={openNewChat}
          openNewChatLoading={openNewChatLoading}
          historyBlocks={historyBlocks}
        />
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
        <TopPanel
          openNewChat={openNewChat}
          openNewChatLoading={openNewChatLoading}
          setLeftPanelOpen={setLeftPanelOpen}
          setRightPanelOpen={setRightPanelOpen}
          exportChat={exportChat}
          chat={chat}
        />

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
                    loading={assistantMessageLoading}
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
        <RightPanel
          model={model}
          preferences={preferences}
          setModel={setModel}
          setPreferences={setPreferences}
          persona={persona}
        />
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
