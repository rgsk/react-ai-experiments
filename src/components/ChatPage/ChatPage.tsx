import { produce } from "immer";
import { useEffect } from "react";
import { v4 } from "uuid";
import useJsonData from "~/hooks/useJsonData";
import useTextStream from "~/hooks/useTextStream";
import { Message } from "~/services/experimentsService";
import MessageInput from "./Children/MessageInput";
export type HandleSend = ({ text }: { text: string }) => void;
interface ChatPageProps {}
const ChatPage: React.FC<ChatPageProps> = ({}) => {
  const { handleGenerate, loading, text } = useTextStream();
  const [messages, setMessages] = useJsonData<Message[]>("messages", []);
  useEffect(() => {
    if (messages) {
      if (
        messages.length > 0 &&
        messages[messages.length - 1].role === "user"
      ) {
        handleGenerate({ messages });
      }
    }
  }, [handleGenerate, messages]);
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
  return (
    <div>
      {messages?.map((message) => (
        <div key={message.id}>
          {message.role}: {message.content}
        </div>
      ))}
      <MessageInput
        handleSend={handleSend}
        loading={loading}
        interrupt={() => {}}
        placeholder="Message"
        interruptEnabled={false}
      />
    </div>
  );
};
export default ChatPage;
