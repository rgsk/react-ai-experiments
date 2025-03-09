import { Message } from "~/lib/typesJsonData";
import { MemoizedMarkdownRenderer } from "../MarkdownRenderer";
import MessageContainer from "../MessageContainer";

interface RenderMessagesProps {
  messages: Message[];
}
const RenderMessages: React.FC<RenderMessagesProps> = ({ messages }) => {
  return (
    <div className="flex flex-col gap-4 items-end">
      {messages.map((message, i) => (
        <MessageContainer
          key={`id: ${message.id}, index - ${i}`}
          role={message.role}
        >
          <MemoizedMarkdownRenderer loading={message.status === "in_progress"}>
            {(message.content ?? "") as string}
          </MemoizedMarkdownRenderer>
        </MessageContainer>
      ))}
    </div>
  );
};
export default RenderMessages;
