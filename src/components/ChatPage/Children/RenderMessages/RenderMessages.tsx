import { Message } from "~/lib/typesJsonData";
import { MemoizedMarkdownRenderer } from "../MarkdownRenderer";

interface RenderMessagesProps {
  messages: Message[];
}
const RenderMessages: React.FC<RenderMessagesProps> = ({ messages }) => {
  return (
    <div>
      {messages.map((message, i) => (
        <div key={`id: ${message.id}, index - ${i}`}>
          <p>{message.role}: </p>{" "}
          {/* IMPORTANT: using MemoizedMarkdownRenderer is essential here, to prevent rerenders */}
          <MemoizedMarkdownRenderer loading={message.status === "in_progress"}>
            {(message.content ?? "") as string}
          </MemoizedMarkdownRenderer>
        </div>
      ))}
    </div>
  );
};
export default RenderMessages;
