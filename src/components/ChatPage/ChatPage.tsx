import { useEffect } from "react";
import useJsonData from "~/hooks/useJsonData";
import useTextStream from "~/hooks/useTextStream";
import { CompletionMessage } from "~/services/experimentsService";
import MessageInput from "./Children/MessageInput";

export type HandleSend = ({ text }: { text: string }) => void;
interface ChatPageProps {}
const ChatPage: React.FC<ChatPageProps> = ({}) => {
  const { handleGenerate, loading, text } = useTextStream();
  const [messages, setMessages] = useJsonData<CompletionMessage[]>(
    "messages",
    []
  );
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
      setMessages((prev) => {
        if (prev) {
          if (prev[prev.length - 1].role === "user") {
            return [...prev, { role: "assistant", content: text }];
          } else {
            return [
              ...prev.slice(0, prev.length - 1),
              { role: "assistant", content: text },
            ];
          }
        }
        return prev;
      });
    }
  }, [setMessages, text]);
  const handleSend: HandleSend = ({ text }) => {
    setMessages((prev) => [...(prev ?? []), { role: "user", content: text }]);
  };
  return (
    <div>
      {messages?.map((message, index) => (
        <div key={index}>
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
