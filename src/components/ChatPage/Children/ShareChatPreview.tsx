import { Check, Copy } from "lucide-react";
import CentralLoader from "~/components/Shared/CentralLoader";
import Container from "~/components/Shared/Container";
import { Button } from "~/components/ui/button";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import useJsonData from "~/hooks/useJsonData";
import { SharedChat } from "~/lib/typesJsonData";
import RenderMessages from "./RenderMessages/RenderMessages";

interface ShareChatPreviewProps {
  sharedChatId: string;
}
const ShareChatPreview: React.FC<ShareChatPreviewProps> = ({
  sharedChatId,
}) => {
  const [sharedChat] = useJsonData<SharedChat>(
    `admin/public/sharedChats/${sharedChatId}`
  );
  const { copy, copied } = useCopyToClipboard();
  return (
    <Container>
      <p>
        Messages sent or received after sharing your link won't be shared.
        Anyone with the URL will be able to view your shared chat.
      </p>
      <div className="h-4"></div>
      <div className="flex-1 overflow-auto border border-foreground rounded-lg">
        <Container>
          {sharedChat ? (
            <RenderMessages messages={sharedChat.messages} type="shared-chat" />
          ) : (
            <CentralLoader />
          )}
        </Container>
      </div>
      <div className="h-4"></div>
      <Button
        onClick={() => {
          const link = `${window.location.origin}/shared-chat/${sharedChatId}`;
          copy(link);
        }}
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
        <span>Copy Link</span>
      </Button>
    </Container>
  );
};
export default ShareChatPreview;
