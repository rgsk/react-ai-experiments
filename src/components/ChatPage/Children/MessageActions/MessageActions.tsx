import { ArrowRotateRight, Copy, Dislike, Like1 } from "iconsax-react";
import { Check } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import DislikeFilledIcon from "~/components/Icons/DislikeFilledIcon";
import LikeFilledIcon from "~/components/Icons/LikeFilledIcon";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import { Message, MessageFeedback } from "~/lib/typesJsonData";
import jsonDataService from "~/services/jsonDataService";
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
  const message = messages[index];
  const currentText = message.content as string;
  const { id: chatId } = useParams<{ id: string }>();
  const [feedback, setFeedback] = useState<{
    type: MessageFeedback["type"];
    text?: string;
  }>();
  const onLikeDislike = async ({
    type,
    text,
  }: {
    type: MessageFeedback["type"];
    text?: string;
  }) => {
    setFeedback({ type, text });
    const feedbackId = v4();
    await jsonDataService.setKey<MessageFeedback>({
      key: `chats/${chatId}/messages/${message.id}/feedback/${feedbackId}`,
      value: {
        createdAt: new Date().toISOString(),
        type: type,
        text: text,
        id: feedbackId,
      },
    });
  };
  return (
    <div className="flex gap-[4px] rounded-sm">
      {" "}
      <ActionButton
        onClick={() => {
          // rerun the last user message
          handleSend({
            text: lastUserMessageText,
          });
        }}
      >
        <ArrowRotateRight size={18} />
      </ActionButton>
      <ActionButton
        onClick={() => {
          copy(currentText);
        }}
      >
        {copiedText === currentText && copied ? (
          <Check size={18} />
        ) : (
          <Copy size={18} />
        )}
      </ActionButton>
      <ActionButton
        onClick={() => {
          onLikeDislike({ type: "like" });
        }}
      >
        {feedback?.type === "like" ? <LikeFilledIcon /> : <Like1 size={18} />}
      </ActionButton>
      <ActionButton
        onClick={() => {
          onLikeDislike({ type: "dislike" });
        }}
      >
        {feedback?.type === "dislike" ? (
          <DislikeFilledIcon />
        ) : (
          <Dislike size={18} />
        )}
      </ActionButton>
    </div>
  );
};
export default MessageActions;

interface ActionButtonProps {
  onClick?: () => void;
  children: any;
}
export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
}) => {
  return (
    <button onClick={onClick} className="hover:bg-accent rounded-[4px] p-1.5">
      {children}
    </button>
  );
};
