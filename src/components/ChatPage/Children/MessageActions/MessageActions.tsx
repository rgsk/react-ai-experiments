import {
  ArrowRotateRight,
  Copy,
  Dislike,
  Like1,
  TickSquare,
} from "iconsax-react";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import { Message } from "~/lib/typesJsonData";
import { HandleSend } from "../../ChatPage";

interface MessageActionsProps {
  handleSend: HandleSend;
  messages: Message[];
  index: number;
}
const MessageActions: React.FC<MessageActionsProps> = ({
  handleSend,
  messages,
  index,
}) => {
  const { copy, copied, copiedText } = useCopyToClipboard();
  const lastUserMessage = messages
    .slice(0, index)
    .reverse()
    .find((m) => m.role === "user");
  const lastUserMessageText = (lastUserMessage?.content ?? "") as string;
  const currentText = messages[index].content;
  return (
    <div className="flex">
      <div className="flex gap-[4px] rounded-sm p-[6px]">
        {" "}
        <ActionButton
          icon={<ArrowRotateRight size={18} />}
          onClick={() => {
            // rerun the last user message
            handleSend({
              text: lastUserMessageText,
            });
          }}
        ></ActionButton>
        <ActionButton
          icon={
            copiedText === currentText && copied ? (
              <TickSquare size={18} />
            ) : (
              <Copy size={18} />
            )
          }
          onClick={() => {
            copy(currentText as string);
          }}
        ></ActionButton>
        <ActionButton
          icon={<Like1 size={18} />}
          onClick={() => {}}
        ></ActionButton>
        <ActionButton
          icon={<Dislike size={18} />}
          onClick={() => {}}
        ></ActionButton>
      </div>
    </div>
  );
};
export default MessageActions;

interface ActionButtonProps {
  onClick?: () => void;
  icon: any;
}
export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
}) => {
  return (
    <button onClick={onClick} className="hover:bg-accent rounded-[4px] p-1">
      {icon}
    </button>
  );
};
