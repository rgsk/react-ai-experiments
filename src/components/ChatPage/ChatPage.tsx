import { produce } from "immer";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import useJsonData from "~/hooks/useJsonData";
import useTextStream from "~/hooks/useTextStream";
import experimentsService, { Message } from "~/services/experimentsService";
import MessageInput from "./Children/MessageInput";
export type HandleSend = ({ text }: { text: string }) => void;
interface ChatPageProps {}
const ChatPage: React.FC<ChatPageProps> = ({}) => {
  const { id: chatId } = useParams<{ id: string }>();
  const { handleGenerate, loading: textStreamLoading, text } = useTextStream();
  const [chat, setChat] = useJsonData(`chat.${chatId}`, {
    id: chatId,
    title: "",
    createdAt: new Date().toISOString(),
  });
  const [messages, setMessages] = useJsonData<Message[]>(
    `chat.${chatId}.messages`,
    []
  );
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const chatRef = useRef(chat);
  chatRef.current = chat;

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
  if (!chat || !messages) {
    return <div>Loading...</div>;
  }
  return (
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
  );
};
export default ChatPage;
