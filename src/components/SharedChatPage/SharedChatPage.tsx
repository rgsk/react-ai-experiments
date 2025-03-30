import { Check, Download, Home, Share } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import useJsonData from "~/hooks/useJsonData";
import { createMarkdownContent } from "~/lib/chatUtils";
import { SharedChat } from "~/lib/typesJsonData";
import { downloadContentFile } from "~/lib/utils";
import RenderMessages from "../ChatPage/Children/RenderMessages/RenderMessages";
import CentralLoader from "../Shared/CentralLoader";
import Container from "../Shared/Container";
import { ModeToggle } from "../Shared/ModeToggle";
import { Button } from "../ui/button";

interface SharedChatPageProps {}
const SharedChatPage: React.FC<SharedChatPageProps> = ({}) => {
  const { copy, copied } = useCopyToClipboard();

  const { id: sharedChatId } = useParams<{ id: string }>();
  const [sharedChat] = useJsonData<SharedChat>(
    `admin/public/sharedChats/${sharedChatId}`
  );

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
    <div className="h-screen flex flex-col">
      <div className="border-b border-b-input p-4 flex justify-between items-center">
        <span className="flex gap-2">
          <Link to="/">
            <Button variant="outline" size="icon">
              <Home />
            </Button>
          </Link>
        </span>
        <span>{sharedChat.chat.title}</span>
        <span className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              copy(window.location.href);
            }}
            size="icon"
          >
            {copied ? <Check /> : <Share />}
          </Button>
          <Button variant="outline" onClick={exportChat} size="icon">
            <Download />
          </Button>
          <ModeToggle />
        </span>
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
