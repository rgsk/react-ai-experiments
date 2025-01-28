import { produce } from "immer";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { v4 } from "uuid";
import useAuthRequired from "~/hooks/auth/useAuthRequired";
import useJsonData from "~/hooks/useJsonData";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import useTextStream from "~/hooks/useTextStream";
import useWebSTT from "~/hooks/useWebSTT";
import { Chat, Message } from "~/lib/typesJsonData";
import { uuidPlaceholder } from "~/lib/utils";
import experimentsService from "~/services/experimentsService";
import OpenAIRealtimeWebRTC from "../RealtimeWebRTC/OpenAIRealtimeWebRTC";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
import { Button } from "../ui/button";
import { MarkdownRenderer } from "./Children/MarkdownRenderer";
import MessageInput from "./Children/MessageInput";
export type HandleSend = ({ text }: { text: string }) => void;
interface ChatPageProps {}
const ChatPage: React.FC<ChatPageProps> = ({}) => {
  const { id: chatId } = useParams<{ id: string }>();
  const { handleGenerate, loading: textStreamLoading, text } = useTextStream();
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
          content: transcript ? transcript : lastMessage.content + delta,
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
  const [messages, setMessages] = useJsonData<Message[]>(
    `chats/${chatId}/messages`,
    []
  );
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const chatRef = useRef(chat);
  chatRef.current = chat;
  useEffect(() => {
    if (chat?.title && !chatUpdating) {
      refetchChatHistory();
    }
  }, [chat?.title, chatUpdating, refetchChatHistory]);
  useEffect(() => {
    if (voiceModeEnabled) return;
    if (messages) {
      if (
        messages.length > 0 &&
        messages[messages.length - 1].role === "user"
      ) {
        handleGenerate({
          messages: messages,
          onComplete: async () => {
            if (chatRef.current?.title) {
              return;
            }
            const currentMessages = messagesRef.current;
            if (currentMessages) {
              // set the title of chat based on current messages
              const { content: title } = await experimentsService.getCompletion(
                {
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
                }
              );
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
          },
        });
      }
    }
  }, [handleGenerate, messages, setChat, voiceModeEnabled]);
  useEffect(() => {
    if (text) {
      setMessages(
        produce((draft) => {
          if (draft) {
            if (draft[draft.length - 1].role === "user") {
              draft.push({
                id: v4(),
                role: "assistant",
                content: text,
                status: "completed",
              });
            } else {
              draft[draft.length - 1].content = text;
            }
          }
        })
      );
    }
  }, [setMessages, text]);
  const handleSend: HandleSend = ({ text }) => {
    setMessages((prev) => [
      ...(prev ?? []),
      { id: v4(), role: "user", content: text, status: "completed" },
    ]);
  };
  if (!chat || !messages || !chatHistory) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <Button
        onClick={() => {
          navigate(`/chat/${v4()}`);
        }}
      >
        New Chat
      </Button>
      <div className="flex gap-8">
        <div className="min-w-[500px]">
          <div className="flex flex-col">
            {chatHistory
              .filter((c) => !!c.title)
              .map((chat) => {
                return (
                  <div key={chat.id}>
                    <p>{chat.id}</p>
                    <NavLink to={`/chat/${chat.id}`}>{chat.title}</NavLink>
                  </div>
                );
              })}
          </div>
        </div>
        <div>
          <h1>{chat.title || "New Chat"}</h1>
          {messages.map((message) => (
            <div key={message.id}>
              <p>{message.role}: </p>{" "}
              <MarkdownRenderer>{message.content}</MarkdownRenderer>
            </div>
          ))}

          <MessageInput
            handleSend={handleSend}
            loading={textStreamLoading}
            interrupt={() => {}}
            placeholder="Message"
            interruptEnabled={false}
          />
          {voiceModeLoading ? (
            <div>
              <p>Initialising Voice Mode...</p>
              <LoadingSpinner />
            </div>
          ) : voiceModeEnabled ? (
            <p>Voice Mode Running</p>
          ) : null}
          <div className="flex gap-2">
            <div>
              <Button
                onClick={() => {
                  setVoiceModeEnabled(true);
                  setVoiceModeLoading(true);
                }}
                disabled={voiceModeEnabled}
              >
                Start
              </Button>
            </div>
            <div>
              <Button
                onClick={() => {
                  setVoiceModeEnabled(false);
                  stopRecognition();
                }}
                disabled={!voiceModeEnabled}
              >
                Stop
              </Button>
            </div>
          </div>
          <OpenAIRealtimeWebRTC
            onDataChannelOpened={() => {
              setVoiceModeLoading(false);
              startRecognition();
            }}
            onUserSpeechStarted={() => {
              startRecognition();
            }}
            onUserSpeechStopped={() => {
              stopRecognition();
            }}
            isEnabled={voiceModeEnabled}
            onAssistantTranscript={() => {
              markLastMessageAsComplete("assistant");
            }}
            onAssistantTranscriptDelta={(delta) => {
              handleMessageDelta({ role: "assistant", delta: delta });
            }}
            onAssistantSpeechStopped={() => {
              // assistant audio response is complete
              startRecognition();
            }}
            initialMessages={messages}
          />
        </div>
      </div>
    </div>
  );
};
export default ChatPage;
