import { produce } from "immer";
import { useEffect, useRef } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { v4 } from "uuid";
import useJsonData from "~/hooks/useJsonData";
import useJsonDataKeysLike from "~/hooks/useJsonDataKeysLike";
import useTextStream from "~/hooks/useTextStream";
import { Chat, Message } from "~/lib/typesJsonData";
import { uuidPlaceholder } from "~/lib/utils";
import experimentsService from "~/services/experimentsService";
import { Button } from "../ui/button";
import MessageInput from "./Children/MessageInput";
export type HandleSend = ({ text }: { text: string }) => void;
interface ChatPageProps {}
const ChatPage: React.FC<ChatPageProps> = ({}) => {
  const { id: chatId } = useParams<{ id: string }>();
  const { handleGenerate, loading: textStreamLoading, text } = useTextStream();
  const { data: chatHistory, refetch: refetchChatHistory } =
    useJsonDataKeysLike<Chat>(`chats/${uuidPlaceholder}`);
  const navigate = useNavigate();
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
  }, [handleGenerate, messages, setChat]);
  useEffect(() => {
    if (text) {
      setMessages(
        produce((draft) => {
          if (draft) {
            if (draft[draft.length - 1].role === "user") {
              draft.push({ id: v4(), role: "assistant", content: text });
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
      { id: v4(), role: "user", content: text },
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
            {chatHistory.map((chat) => {
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
              {message.role}: {message.content}
            </div>
          ))}
          <MessageInput
            handleSend={handleSend}
            loading={textStreamLoading}
            interrupt={() => {}}
            placeholder="Message"
            interruptEnabled={false}
          />
        </div>
      </div>
    </div>
  );
};
export default ChatPage;
