import { Check, Copy, Download } from "lucide-react";
import { useParams } from "react-router-dom";
import useBreakpoints from "~/hooks/useBreakpoints";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import useJsonData from "~/hooks/useJsonData";
import { createMarkdownContent } from "~/lib/chatUtils";
import { SharedChat } from "~/lib/typesJsonData";
import { downloadContentFile } from "~/lib/utils";
import RenderMessages from "../ChatPage/Children/RenderMessages/RenderMessages";
import CentralLoader from "../Shared/CentralLoader";
import Container from "../Shared/Container";
import { Button } from "../ui/button";

interface SharedChatPageProps {}
const SharedChatPage: React.FC<SharedChatPageProps> = ({}) => {
  const { copy, copied } = useCopyToClipboard();

  const { id: sharedChatId } = useParams<{ id: string }>();
  const [sharedChat] = useJsonData<SharedChat>(
    `admin/public/sharedChats/${sharedChatId}`
  );
  const { md } = useBreakpoints();
  const exportChat = () => {
    if (!sharedChat) return;
    const markdown = createMarkdownContent(sharedChat.messages);
    downloadContentFile({
      content: markdown,
      filename: `Chat: ${sharedChat.chat.title}.md`,
    });
  };

  if (!sharedChat) {
    return <CentralLoader />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-b-input p-4 grid md:grid-cols-3 items-center">
        <div></div>
        <div className="text-center">{sharedChat.chat.title}</div>
        {md && (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                copy(window.location.href);
              }}
            >
              {copied ? <Check /> : <Copy />}
              <span>Copy Link</span>
            </Button>
            <Button variant="outline" onClick={exportChat}>
              <Download />
              <span>Export</span>
            </Button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        <Container>
          <RenderMessages messages={sharedChat.messages} type="shared-chat" />
        </Container>
      </div>
    </div>
  );
};
export default SharedChatPage;
