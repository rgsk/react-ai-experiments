import { Copy, X } from "lucide-react";
import { useState } from "react";
import Container from "~/components/Shared/Container";
import DialogWrapper from "~/components/Shared/DialogWrapper";
import { LoadingSpinner } from "~/components/Shared/LoadingSpinner";
import { Button } from "~/components/ui/button";
import useBreakpoints from "~/hooks/useBreakpoints";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import { useWindowSize } from "~/hooks/useWindowSize";
import { getSharedChatDetails } from "~/lib/chatUtils";
import { Chat, Message } from "~/lib/typesJsonData";
import RenderMessages from "./RenderMessages/RenderMessages";

interface ShareChatPreviewProps {
  chat: Chat;
  messages: Message[];
  chatKey: string;
  open: boolean;
  onClose: () => void;
}
const ShareChatPreview: React.FC<ShareChatPreviewProps> = ({
  messages,
  chat,
  chatKey,
  open,
  onClose,
}) => {
  const { copy, copied } = useCopyToClipboard();
  const [loading, setLoading] = useState(false);
  const [sharedChatId, setSharedChatId] = useState<string>();
  const windowSize = useWindowSize();
  const { md } = useBreakpoints();
  const handleClose = () => {
    onClose();
    setSharedChatId(undefined);
  };
  return (
    <DialogWrapper open={open} onClose={handleClose}>
      <div
        style={{ height: md ? windowSize.height / 2 : windowSize.height }}
        className="flex flex-col"
      >
        <div className="p-4 border-b border-b-input flex justify-between items-center">
          <span>
            {chat.sharedChatId ? "Update" : "Share"} public link to chat
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              handleClose();
            }}
          >
            <X />
          </Button>
        </div>
        <Container>
          <p>
            Messages sent or received after sharing your link won't be shared.
            Anyone with the URL will be able to view your shared chat.
          </p>
          <div className="h-4"></div>
          <div className="flex-1 overflow-auto border border-foreground rounded-lg">
            <Container>
              <RenderMessages messages={messages} type="shared-chat" />
            </Container>
          </div>
          <div className="h-4"></div>
          <Button
            disabled={loading}
            onClick={async () => {
              if (sharedChatId) {
                copy(`${window.location.origin}/shared-chat/${sharedChatId}`);
              } else {
                setLoading(true);
                const { sharedChatId: id, type } = await getSharedChatDetails({
                  chat,
                  chatKey,
                  messages,
                });
                setSharedChatId(id);
                copy(`${window.location.origin}/shared-chat/${id}`);
                setLoading(false);
              }
            }}
          >
            {loading ? <LoadingSpinner size={18} /> : <Copy size={18} />}
            {copied ? (
              <span>Copied</span>
            ) : (
              <span>
                {sharedChatId
                  ? "Copy"
                  : chat.sharedChatId
                  ? "Update"
                  : "Create"}{" "}
                Link
              </span>
            )}
          </Button>
        </Container>
      </div>
    </DialogWrapper>
  );
};
export default ShareChatPreview;
