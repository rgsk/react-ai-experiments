import { ArrowRotateRight, Copy, Dislike, Like1 } from "iconsax-react";
import { Check, CircleStop, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import DislikeFilledIcon from "~/components/Icons/DislikeFilledIcon";
import LikeFilledIcon from "~/components/Icons/LikeFilledIcon";
import ActionButton from "~/components/Shared/ActionButton";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import usePlayAudio from "~/hooks/usePlayAudio";
import { Message, MessageFeedback } from "~/lib/typesJsonData";
import jsonDataService from "~/services/jsonDataService";
import { HandleSend } from "../../ChatPage";
import { DisplayMessagesType } from "../RenderMessages/RenderMessages";

interface MessageActionsProps {
  handleSend?: HandleSend;
  messages: Message[];
  index: number;
  type: DisplayMessagesType;
}
const MessageActions: React.FC<MessageActionsProps> = ({
  handleSend,
  messages,
  index,
  type,
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
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const {
    playAudio,
    playing,
    stopPlaying,
    loading: audioLoading,
  } = usePlayAudio({ audioPlayerRef });
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
        tooltip="Copy"
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
      {type === "chat" && (
        <>
          <ActionButton
            tooltip="Regenerate"
            onClick={() => {
              // rerun the last user message
              handleSend?.({
                text: lastUserMessageText,
              });
            }}
          >
            <ArrowRotateRight size={18} />
          </ActionButton>
          <ActionButton
            disabled={feedback?.type === "like"}
            tooltip="Like"
            onClick={() => {
              onLikeDislike({ type: "like" });
            }}
          >
            {feedback?.type === "like" ? (
              <LikeFilledIcon />
            ) : (
              <Like1 size={18} />
            )}
          </ActionButton>
          <ActionButton
            disabled={feedback?.type === "dislike"}
            tooltip="Dislike"
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
          <ActionButton
            tooltip="Read aloud"
            onClick={() => {
              if (playing) {
                stopPlaying();
              } else {
                playAudio({ text: currentText });
              }
            }}
          >
            {audioLoading ? (
              <LoadingSpinner size={16} />
            ) : playing ? (
              <CircleStop size={18} strokeWidth={1.6} />
            ) : (
              <Volume2 size={18} strokeWidth={1.6} />
            )}
          </ActionButton>
          <audio className="hidden" ref={audioPlayerRef}></audio>
        </>
      )}
    </div>
  );
};
export default MessageActions;
